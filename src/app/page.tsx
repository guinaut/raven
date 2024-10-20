'use client';

import { 
  Group, 
  Stack,
  Text,
  Box,
  Center,
  TextInput,
  Textarea,
  Button,
  Flex,
  Paper,
  ScrollArea,
} from "@mantine/core";

import { useForm } from '@mantine/form';
import { useChat, Message } from 'ai/react';
import { useEffect, useRef, useState, } from 'react';
import useSWR from 'swr';

function useDirective (directive: string) {
  const fetcher = (url: string, raven_directive: string) => {
    if (raven_directive.length === 0) {
      return '';
    }
    return fetch(url, {
        headers: new Headers({
          'Content-Type': 'application/json',
        }),
        credentials: 'same-origin',
        method: 'POST',
        body: JSON.stringify({
          directive: raven_directive,
        }),
      })
      .then((res) => res.json())
      .then(data => {
        return data;
      });
  }

  const { data, error, isLoading } = useSWR(['/api/raven', directive], ([url, directive]) => fetcher(url, directive));
 
  return {
    data: data,
    isLoading,
    isError: error
  }
}


export default function HomePage() {
  const { messages, setInput, handleSubmit } = useChat();
  
  const [directive, setDirective] = useState('');
  const { data, isLoading } = useDirective(directive);
  const [ showMessages, setShowMessages ] = useState<Message[]>([]);
  // for the scroll space
  const viewport = useRef<HTMLDivElement>(null);
  const scrollToBottom = () =>
    viewport.current!.scrollTo({ top: viewport.current!.scrollHeight, behavior: 'smooth' });

  const directiveForm = useForm({
    initialValues: {
      topic: '',
      directive: '',
    },

    validate: {
      directive: (value) => (value.length > 10 ? null : 'Sqwak! Need detail to ask question!'),
    },
  });

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      user_response: '',
    },

    validate: {
      user_response: (value) => (value.length >= 1 ? null : "Let me know what you really think."),
    },
  });

  const sendARaven = (values: { directive: string }) => {
    setDirective(values.directive);
  }

  useEffect(() => {
    console.log('message length', messages.length);
    if (messages.length > 1) {
      setShowMessages([...messages]);
      scrollToBottom();
      form.setFieldValue('user_response', '');
    }
  }, [messages, form]);

  useEffect(() => {
    console.log(isLoading, data);
    if (data && data.text && data.system_prompt) {
      const { text, system_prompt } = data;
      if (text.length > 0 && system_prompt.length > 0) {
        console.log('have a response');
        messages.push({ id:'0', role: 'system', content: system_prompt });
        messages.push({ id:'1', role: 'assistant', content: text });
        setShowMessages([...messages]);
      }
    }
  }, [data, isLoading, messages]);

  const handleSubmitUserChatMessage = (values: { user_response: string }) => {
    const { user_response } = values;
    console.log('validating chat message', values);
    if (form.validate()) {
      setInput(user_response);
      handleSubmit();
      console.log('submitting user chat message');
    }
  }

  return (
    <Group grow>
        <Center>
      <Stack align="stretch">
        <Center>
            <Text size="xl" fw={900} variant="gradient">
                RavenChat
            </Text>
        </Center>
        <Flex h={600} gap="sm" justify="flex-start" align="flex-start">
          <form onSubmit={directiveForm.onSubmit((values) => { sendARaven(values);})}>
            <Stack w={340} 
              align="stretch"
              justify="flex-start"
              gap="md">
                <TextInput 
                  withAsterisk
                  label="Topic:"
                  placeholder="What is this about?"
                  {...directiveForm.getInputProps('topic')}
                />
                <Textarea
                  size="sm"
                  withAsterisk
                  label="What do you want to know?"
                  placeholder="What would you like your Raven to ask?"
                  resize="vertical"
                  autosize
                  minRows={5}
                  {...directiveForm.getInputProps('directive')}
                />
                <Text size="xs" c="grey.5">
                  If you are super <b>controlling</b> and want to ask questions in a certain order
                  and think you know the best variables, you can do the following:
                  <br /> {`1. What is your favorite {{color}}?`}
                  <br /> {`2. What is your favorite {{animal}}?`}
                  <br />
                  <br />Fair warning. I&apos;m a Raven and we do things our way. Sqwak!
                </Text>
                <Group justify="center" mt="md">
                  <Button type="submit">Send Raven</Button>
                </Group>
            </Stack>
          </form>
          
          <Stack w={340} 
              style={{ borderWidth: 1, borderColor: 'grey', borderStyle: 'solid', borderRadius: 15 }}
              align="stretch"
              justify="flex-end"
              gap="md" h="100%"
              p={10}
              pt={0}>
            <ScrollArea viewportRef={viewport}>
              <Box w="100%" m={0}>
                {showMessages.map(m => (
                  <Stack key={`stack-${m.id}`} p={0} m={0}>
                  {(m && m.content) &&<>
                    {(m.role === 'user') && 
                      <Group justify="flex-end" pt={10}>
                        <Paper w="90%" shadow="xs" radius="md" withBorder p="xs" bg="blue.8"  >
                          <Text size="sm"> {m.content}</Text>
                        </Paper>
                      </Group>
                    }

                    {(m.role === 'assistant') && 
                      <Group justify="flex-start" pt={10}  >
                        <Paper w="90%" shadow="xs" radius="md" withBorder p="xs" bg="green.8"  >
                          <Text size="sm"> {m.content}</Text>
                        </Paper>
                      </Group>
                    }
                    </>}
                  </Stack>
                ))}
              </Box>
            </ScrollArea>
            <Box w="100%" m={0}>
              <form 
                onSubmit={form.onSubmit((values) => handleSubmitUserChatMessage(values))}
              >
              <TextInput
                  size="sm"
                  withAsterisk
                  label=""
                  placeholder=""
                  key={form.key('user_response')}
                  {...form.getInputProps('user_response')}
                />
                <Group justify="flex-end" mt="md">
                  <Button type="submit">Submit</Button>
                </Group>
              </form>
            </Box>
          </Stack>
        </Flex>
      </Stack>
      </Center>
    </Group>
  );
}
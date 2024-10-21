'use client';

import { 
  Group, 
  Stack,
  Text,
  Box,
  Center,
  TextInput,
  Button,
  Flex,
  Paper,
  ScrollArea,
} from "@mantine/core";

import { useForm } from '@mantine/form';
import { useChat } from 'ai/react';
import { useEffect, useRef, useState, } from 'react';
import useSWR from 'swr';
import Markdown from 'react-markdown'

function useRaven(short_link: string) {
  const fetcher = (url: string, short_link: string) => {
    if (short_link.length === 0) {
      return null;
    }
    return fetch(url, {
        headers: new Headers({
          'Content-Type': 'application/json',
        }),
        credentials: 'same-origin',
        method: 'GET'
      })
      .then((res) => res.json())
      .then(data => {
        return data;
      });
  }

  const { data, error, isLoading } = useSWR([`/api/v1/raven/${short_link}`, short_link], ([url, short_link]) => fetcher(url, short_link));
 
  return {
    data: data,
    isLoading,
    isError: error
  }
}


export default function Page({ params }: { params: { short_link: string } }) {
  const { short_link } = params;
  const { data, isLoading } = useRaven(short_link);
  const [ raven, setRaven ] = useState<any>(null); 
  const { messages, setInput, append } = useChat();

  useEffect(() => {
    if (!isLoading && data) {
      setRaven(data);
    }
  }, [data, isLoading]);

  useEffect(() => {
    if (raven && raven.messages && raven.messages.length === 0 && messages && messages.length === 0) {
      messages.push({ id:'_0', role: 'system', content: raven.system_prompt });
      append({ role: 'system', content: 'What is the opening question?' });
    }
  }, [raven, append, messages]);



  // for the scroll space
  const viewport = useRef<HTMLDivElement>(null);
  const scrollToBottom = () =>
    viewport.current!.scrollTo({ top: viewport.current!.scrollHeight, behavior: 'smooth' });

  const form = useForm({
    initialValues: {
      user_response: '',
    },
    validate: {
      user_response: (value) => (value.length >= 1 ? null : "Let me know what you really think."),
    },
  });

  useEffect(() => {
    if (form.values.user_response.length > 0) {
      setInput(form.values.user_response);
    }
  }, [form.values.user_response, setInput]);
  
  useEffect(() => {
    if (messages.length > 1) {
      scrollToBottom();
    }
  }, [messages]);
  const handleSubmitUserChatMessage = (values: { user_response: string }) => {
    const { user_response } = values;
    if (form.validate()) {
      append({ role: 'user', content: user_response });
      form.setFieldValue('user_response', '');
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
          <Stack w={340} 
              style={{ borderWidth: 1, borderColor: 'grey', borderStyle: 'solid', borderRadius: 15 }}
              align="stretch"
              justify="flex-end"
              gap="md" h="100%"
              p={10}
              pt={0}>
            <ScrollArea viewportRef={viewport}>
              <Box w="100%" m={0}>
                {messages.map(m => (
                  <Stack key={`stack-${m.id}`} p={0} m={0}>
                  {(m && m.content) &&<>
                    {(m.role === 'user') && 
                      <Group justify="flex-end" pt={5}>
                        <Paper w="90%" shadow="xs" radius="md" withBorder p="xs" bg="blue.8"  >
                          <Text size="sm"> {m.content}</Text>
                        </Paper>
                      </Group>
                    }

                    {(m.role === 'assistant') && 
                      <Group justify="flex-start" pt={5} m={0} >
                        <Paper w="90%" shadow="xs" radius="md" withBorder p="xs" bg="green.8" m={0}  >
                          <Text size="sm" component="span"><Markdown>{m.content}</Markdown></Text>
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
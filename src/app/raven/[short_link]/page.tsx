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
import Cookies from 'js-cookie';
import { useForm } from '@mantine/form';
import { useChat } from 'ai/react';
import { useEffect, useRef, useState, } from 'react';
import useSWR from 'swr';
import Markdown from 'react-markdown'

function useRecipient(short_link: string, public_key: string) {
  
  const fetcher = async (url: string, short_link: string, public_key: string) => {
    if (short_link.length === 0) {
      return null;
    }
    return fetch(url, {
      headers: new Headers({
          'Content-Type': 'application/json',
      }),
      credentials: 'same-origin',
      method: 'POST',
      body: JSON.stringify({
        public_key
      }),
    })
    .then((res) => res.json())
    .then(data => {
      return data;
    })
    .catch((error) => {
      console.error('Error fetching:', error);
    });
  }

  const { data, error, isLoading } = useSWR([`/api/v1/recipient/${short_link}`, short_link], ([url, short_link]) => fetcher(url, short_link, public_key));
 
  return {
    data: data,
    isLoading,
    isError: error
  }
}


export default function Page({ params }: { params: { short_link: string } }) {
  const { short_link } = params;
  //Cookies.remove('ravenCookie');
  const ravenCookie = Cookies.get('ravenCookie');
  let public_key: string = '';
  if (ravenCookie) {
    const parse_cookie = JSON.parse(ravenCookie);
    if (parse_cookie && parse_cookie.public_key) {
      public_key = parse_cookie.public_key;
    }
  }
  const { data, isLoading } = useRecipient(short_link, public_key);
  const [ recipient, setRecipient ] = useState<any>(null);
  const { messages, setInput, append } = useChat();
  const [ viewMessages, setViewMessages ] = useState<any>([]);

  const getChatBody = (new_recipient: any) => {
    return {
      recipient_id: new_recipient.id,
    }
  }

  useEffect(() => {
    if (!isLoading && data) {
      Cookies.set('ravenCookie', JSON.stringify({
        public_key: data.public_key,
      }), { expires: 30, sameSite: 'strict' });
      setRecipient(data);
    }
  }, [data, isLoading]);

  useEffect(() => {
    if (recipient) {
      const ravenCookie = Cookies.get('ravenCookie');
      if (recipient.messages && recipient.messages.length === 1) {
        console.log('first time');
        const first_msg:any = recipient.messages[0];
        messages.push({role:first_msg.content.role, content:first_msg.content.text, id: first_msg.id});
        append({ role: 'system', content: 'Introduce yourself and ask the right opening question.' }, {
          body: {
            ...getChatBody(recipient)
          }
        });
      } else {
        const _msgs = recipient.messages.map((m: any) => {
          return {role:m.content.role, content:m.content.text, id: m.id};
        });
        messages.push(..._msgs);
        setViewMessages([...messages]);
      }
    }
  }, [recipient, append]);

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

  const handleSubmitUserChatMessage = (values: { user_response: string }) => {
    const { user_response } = values;
    if (form.validate()) {
      append({ role: 'user', content: user_response }, {
        body: {
          ...getChatBody(recipient)
        }
      });
      form.setFieldValue('user_response', '');
    }
  }

  useEffect(() => {
    if (form.values.user_response.length > 0) {
      setInput(form.values.user_response);
    }
  }, [form.values.user_response, setInput]);

  useEffect(() => {
    if (messages.length > 1) {
      setViewMessages([...messages]);
    }
  }, [messages]);

  useEffect(() => {
    if (viewMessages.length > 1) {
      scrollToBottom();
    }
  }, [viewMessages]);

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
                {viewMessages.map(m => (
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
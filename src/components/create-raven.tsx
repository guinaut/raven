'use client';

import { useEffect } from "react";
import { 
  Group, 
  Stack,
  Text,
  TextInput,
  Textarea,
  Button,
  Card,
  Image,
} from "@mantine/core";
import { useForm } from '@mantine/form';
import { Raven } from '@prisma/client';
import NextImage from 'next/image';
import ravenLaunchImage from '../assets/raven-friendly-wideview.png';
import Cookies from 'js-cookie';

import { useState } from 'react';
import { PillsInput, Pill, Combobox, CheckIcon, useCombobox } from '@mantine/core';

// Stub for querying past email addresses
const pastEmails = ['user1@example.com', 'user2@example.com', 'user3@example.com'];

const EmailSelector = (props: { 'data-path'?: string, error?: any, onBlur?: Function, onChange?: Function, onFocus?: Function, value?: string[]}) => {
    const { 
        onChange = (value: any) => { console.log(value)},
    } = props;
    const combobox = useCombobox({
      onDropdownClose: () => combobox.resetSelectedOption(),
      onDropdownOpen: () => combobox.updateSelectedOptionIndex('active'),
    });
    const [search, setSearch] = useState('');
    const [pills, setPills] = useState<string[]>(['Public']);
    const [isPublic, setIsPublic] = useState(true);
  
    //const [value, setValue ] = useState<string[]>([]);
    useEffect(() => {
        onChange(pills);
    }, [pills]);
    

    const handleValueSelect = (val: string) => {
      if (val === 'Public') {
        setIsPublic(true);
        setPills(['Public']);
      } else if (!isPublic) {
        setPills((current) => (current.includes(val) ? current.filter((v) => v !== val) : [...current, val]));
      }
    };
  
    const handleValueRemove = (val: string) => {
      if (val === 'Public') {
        setIsPublic(false);
        setPills([]);
      } else {
        setPills((current) => current.filter((v) => v !== val));
      }
    };
  
    const handleCustomEmailAdd = () => {
      const email = search.trim();
      if (email && /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email) && !pills.includes(email)) {
        setPills((current) => [...current, email]);
        setSearch('');
      }
    };
  
    const values = pills.map((item) => (
      <Pill key={item} withRemoveButton onRemove={() => handleValueRemove(item)}>
        {item}
      </Pill>
    ));
  
    const options = [
      <Combobox.Option value="Public" key="Public">
        <Group gap="sm">
          {isPublic ? <CheckIcon size={12} /> : null}
          <span>Public</span>
        </Group>
      </Combobox.Option>,
      ...(!isPublic ? pastEmails
        .filter((item) => item.toLowerCase().includes(search.trim().toLowerCase()))
        .map((item) => (
          <Combobox.Option value={item} key={item} active={pills.includes(item)}>
            <Group gap="sm">
              {pills.includes(item) ? <CheckIcon size={12} /> : null}
              <span>{item}</span>
            </Group>
          </Combobox.Option>
        )) : []),
    ];
  
    return (
      <Combobox store={combobox} onOptionSubmit={handleValueSelect} >
        <Combobox.DropdownTarget>
          <PillsInput label="Who is this for?" onClick={() => combobox.openDropdown()} >
            <Pill.Group>
              {values}
  
              <Combobox.EventsTarget>
                <PillsInput.Field
                  onFocus={() => combobox.openDropdown()}
                  onBlur={() => combobox.closeDropdown()}
                  value={search}
                  placeholder="Add emails or make it public"
                  onChange={(event) => {
                    combobox.updateSelectedOptionIndex();
                    setSearch(event.currentTarget.value);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      handleCustomEmailAdd();
                    } else if (event.key === 'Backspace' && search.length === 0) {
                      event.preventDefault();
                      handleValueRemove(pills[pills.length - 1]);
                    }
                  }}
                />
              </Combobox.EventsTarget>
            </Pill.Group>
          </PillsInput>
        </Combobox.DropdownTarget>
  
        <Combobox.Dropdown>
          <Combobox.Options>
            {options.length > 0 ? options : <Combobox.Empty>Nothing found...</Combobox.Empty>}
          </Combobox.Options>
        </Combobox.Dropdown>
      </Combobox>
    );
  }


const createRavenFetch = async (props: { topic: string, directive: string, recipients: string[]}) => {
    const { topic, directive, recipients } = props;
    try {
        const res = await fetch('/api/v1/raven', {
            headers: new Headers({
                'Content-Type': 'application/json',
            }),
            credentials: 'same-origin',
            method: 'PUT',
            body: JSON.stringify({
                topic, directive, recipients
            }),
        });
        const data = await res.json();
        return data;
    } catch (error) {
        console.error('Error fetching ravens:', error);
    }
};


const CreateRaven = () => {
  const directiveForm = useForm({
      initialValues: {
          topic: '',
          directive: '',
          recipients: [],
      },

      validate: {
          topic: (value) => (value.length > 1 ? null : 'Sqwak! What is this about?'),
          directive: (value) => (value.length > 10 ? null : 'Sqwak! Need detail to ask question!'),
          recipients: (value) => (value.length > 0 ? null : 'Sqwak! Who am I talking to?!'),
      },
  });
  
  const saveRaven = () => {
      const { topic, directive, recipients } = directiveForm.values;
      const { hasErrors = true } = directiveForm.validate();
      if (!hasErrors) {
          createRavenFetch({ topic, directive, recipients })
          .then((data: Raven) => {
              if (data) {
                  directiveForm.reset();
              }
          });
      }
  }
  
  const sendRaven = () => {
    saveRaven();
  }

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder w={{xs: 340, sm:340, md:400, lg:500, xl:500}}>
      <Card.Section>
          <Image
              component={NextImage} 
              src={ravenLaunchImage}
              height={200}
              alt="Preparing to send a Raven"
          />
      </Card.Section>
      <Card.Section p="lg">
          <form >
              <Stack 
                  align="stretch"
                  justify="flex-start"
                  gap="md">
                  <TextInput 
                      withAsterisk
                      label="Topic:"
                      placeholder="What is this about?"
                      {...directiveForm.getInputProps('topic')}
                  />
                  <EmailSelector
                      {...directiveForm.getInputProps('recipients')}
                  />
                  <Textarea
                      size="sm"
                      withAsterisk
                      label="What message shall I carry?"
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
                      <Button onClick={() => saveRaven()} color="yellow">Add to the Aerie</Button>
                      <Button onClick={() => sendRaven()}>Send me!</Button>
                  </Group>
              </Stack>
          </form>
      </Card.Section>
    </Card>
  );
}

export { CreateRaven }
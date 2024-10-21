'use client';

import { 
  Group, 
  Stack,
  Text,
  TextInput,
  Textarea,
  Button,
} from "@mantine/core";

import { useForm } from '@mantine/form';
import { Raven } from '@prisma/client';


const createRavenFetch = async (props: { topic: string, directive: string}) => {
    const { topic, directive } = props;
    try {
        const res = await fetch('/api/v1/raven', {
            headers: new Headers({
                'Content-Type': 'application/json',
            }),
            credentials: 'same-origin',
            method: 'PUT',
            body: JSON.stringify({
                topic, directive,
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
        },

        validate: {
            topic: (value) => (value.length > 1 ? null : 'Sqwak! What is this about?'),
            directive: (value) => (value.length > 10 ? null : 'Sqwak! Need detail to ask question!'),
        },
    });
    
    const saveRaven = (values: { topic: string, directive: string }) => {
        const { topic, directive } = values;
        createRavenFetch({ topic, directive })
        .then((data: Raven) => {
            if (data) {
                directiveForm.reset();
            }
        });
    }

    return (<>
        <form onSubmit={directiveForm.onSubmit((values) => { saveRaven(values);})}>
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
                    <Button type="submit">Save Raven</Button>
                </Group>
            </Stack>
        </form>
    </>);
}

export { CreateRaven }
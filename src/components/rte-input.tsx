/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from 'react';
import { RichTextEditor } from '@mantine/tiptap';

import { useEditor } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Input } from '@mantine/core';
import { Markdown } from 'tiptap-markdown';
import classes from './rte-input.module.css';

interface CustomInputProps {
	startingValue: string;
	value?: string;
	defaultValue?: string;
	onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
	onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
	onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
	label: string;
	description?: string;
	error?: string;
}

export const EditorInput = ({ startingValue, value, defaultValue, onChange, onFocus, onBlur, error, label, description }: CustomInputProps) => {
	const [focus, setFocus] = useState(false);

	const onFocusHandler = (event: React.FocusEvent<HTMLInputElement>) => {
		setFocus(true);
		if (onFocus) {
			onFocus(event);
		}
	};

	const onBlurHandler = (event: React.FocusEvent<HTMLInputElement>) => {
		setFocus(false);
		if (onBlur) {
			onBlur(event);
		}
	};

	const editor = useEditor(
		{
			extensions: [StarterKit, Markdown, Placeholder.configure({ placeholder: defaultValue })],

			onUpdate({ editor }) {
				const content = editor.storage.markdown.getMarkdown(); //editor.getHTML();
				if (onChange) {
					onChange(content as never);
				}
			},
			editorProps: {
				attributes: {
					class: classes.editor,
				},
			},
			content: startingValue,
			immediatelyRender: false,
		},
		[startingValue],
	);

	return (
		<Input.Wrapper withAsterisk label={label} description={description} error={error} onFocus={onFocusHandler} onBlur={onBlurHandler}>
			<RichTextEditor mb={8} editor={editor} className={error ? classes.rteRootError : focus ? classes.rteRootFocus : classes.rteRootGeneral}>
				<RichTextEditor.Content />
			</RichTextEditor>
		</Input.Wrapper>
	);
};

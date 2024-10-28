'use client';

import { useEffect, useState } from 'react';
import { Group, PillsInput, Pill, Combobox, CheckIcon, useCombobox } from '@mantine/core';
import useSWR from 'swr';
import { Contact } from '@prisma/client';

function useContacts(url: string, userId: string | undefined) {
	const fetcher = async (url: string, userId: string | undefined) => {
		if (!userId || userId.length === 0) {
			return [];
		}
		return fetch(url, {
			headers: new Headers({
				'Content-Type': 'application/json',
			}),
			credentials: 'same-origin',
			method: 'POST',
			body: JSON.stringify({
				userId,
			}),
		})
			.then((res) => res.json())
			.then((data) => {
				return data;
			})
			.catch((error) => {
				console.error('Error fetching:', error);
			});
	};

	const { data, error, isLoading } = useSWR([`/api/v1/account/contact/list`, userId], ([url, userId]) => fetcher(url, userId));

	return {
		contacts: data,
		isLoading,
		isError: error,
	};
}

const EmailSelector = (props: {
	'data-path'?: string;
	error?: string | null;
	onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
	onChange?: (event: React.FocusEvent<HTMLInputElement> | string[]) => void;
	onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
	value?: string[];
}) => {
	const { onChange, error } = props;

	const combobox = useCombobox({
		onDropdownClose: () => combobox.resetSelectedOption(),
		onDropdownOpen: () => combobox.updateSelectedOptionIndex('active'),
	});
	const [userId, setUserId] = useState<string>('');
	const [search, setSearch] = useState('');
	const [pills, setPills] = useState<string[]>([]);
	const [isPublic, setIsPublic] = useState(false);
	const [pastEmails, setPastEmails] = useState<string[]>([]);
	const { contacts, isLoading, isError } = useContacts('/api/v1/account/contact/list', userId);

	const handleValueSelect = (val: string) => {
		if (val === 'Public') {
			setIsPublic(true);
			setPills(['Public']);
			if (onChange) {
				onChange(['Public']);
			}
		} else if (!isPublic) {
			const new_pills = pills.includes(val) ? pills.filter((v) => v !== val) : [...pills, val];
			setPills(new_pills);
			if (onChange) {
				onChange(new_pills);
			}
		}
	};

	const handleValueRemove = (val: string) => {
		if (val === 'Public') {
			setIsPublic(false);
			setPills([]);
			if (onChange) {
				onChange([]);
			}
		} else {
			const new_pills: string[] = pills.filter((v) => v !== val);
			setPills(new_pills);
			if (onChange) {
				onChange(new_pills);
			}
		}
	};

	const handleCustomEmailAdd = () => {
		const email = search.trim();
		if (email && /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email) && !pills.includes(email)) {
			const new_pills = [...pills, email];
			if (!pastEmails.includes(email)) {
				setPastEmails((current) => [...current, email]);
			}
			setPills(new_pills);
			if (onChange) {
				onChange(new_pills);
			}
			setSearch('');
		}
	};

	useEffect(() => {
		if (contacts && !isLoading && !isError) {
			setPastEmails(contacts.map((contact: Contact) => contact.email));
		}
	}, [contacts, isLoading, isError]);

	useEffect(() => {
		setUserId('cm2qbp50s0000s98b9jrf2zah');
	}, []);

	const values = pills.map((item) => (
		<Pill key={item} withRemoveButton onRemove={() => handleValueRemove(item)}>
			{item}
		</Pill>
	));

	const options = [
		<Combobox.Option value="Public" key="Public">
			<Group gap="sm" m={0} p={0}>
				{isPublic ? <CheckIcon size={12} /> : null}
				<span>Public</span>
			</Group>
		</Combobox.Option>,
		...(!isPublic
			? pastEmails
					.filter((item) => item.toLowerCase().includes(search.trim().toLowerCase()))
					.map((item) => (
						<Combobox.Option value={item} key={item} active={pills.includes(item)}>
							<Group gap="sm" m={0} p={0}>
								{pills.includes(item) ? <CheckIcon size={12} /> : null}
								<span>{item}</span>
							</Group>
						</Combobox.Option>
					))
			: []),
	];

	return (
		<Combobox store={combobox} onOptionSubmit={handleValueSelect}>
			<Combobox.DropdownTarget>
				<PillsInput error={error} label="Who is this for?" onClick={() => combobox.openDropdown()}>
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
				<Combobox.Options>{options.length > 0 ? options : <Combobox.Empty>Nothing found...</Combobox.Empty>}</Combobox.Options>
			</Combobox.Dropdown>
		</Combobox>
	);
};

export { EmailSelector };

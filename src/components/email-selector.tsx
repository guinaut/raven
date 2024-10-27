'use client';

import { useEffect, useState } from 'react';
import { Group, PillsInput, Pill, Combobox, CheckIcon, useCombobox } from '@mantine/core';
import useSWR from 'swr';
import { Contact } from '@prisma/client';

function useContacts(url: string, userId: string | undefined) {
	const fetcher = async (url: string, userId: string | undefined) => {
		if (!userId || userId.length === 0) {
			return null;
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

	const { data, error, isLoading } = useSWR(
		[`/api/v1/account/contact/list`, userId],
		([url, userId]) => fetcher(url, userId),
	);

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
	const userId = 'cm2qbp50s0000s98b9jrf2zah';
	const { onChange } = props;

	const combobox = useCombobox({
		onDropdownClose: () => combobox.resetSelectedOption(),
		onDropdownOpen: () => combobox.updateSelectedOptionIndex('active'),
	});
	const [search, setSearch] = useState('');
	const [pills, setPills] = useState<string[]>(['Public']);
	const [isPublic, setIsPublic] = useState(true);
	const [pastEmails, setPastEmails] = useState<string[]>([
		'user1@example.com',
		'user2@example.com',
		'user3@example.com',
	]);
	const { contacts, isLoading, isError } = useContacts(
		'/api/v1/account/contact/list',
		userId,
	);

	useEffect(() => {
		if (onChange) {
			onChange(pills);
		}
	}, [pills, onChange]);

	const handleValueSelect = (val: string) => {
		if (val === 'Public') {
			setIsPublic(true);
			setPills(['Public']);
		} else if (!isPublic) {
			setPills((current) =>
				current.includes(val)
					? current.filter((v) => v !== val)
					: [...current, val],
			);
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
		if (
			email &&
			/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email) &&
			!pills.includes(email)
		) {
			setPills((current) => [...current, email]);
			if (!pastEmails.includes(email)) {
				setPastEmails((current) => [...current, email]);
			}
			setSearch('');
		}
	};

	useEffect(() => {
		if (contacts && !isLoading && !isError) {
			setPastEmails(contacts.map((contact: Contact) => contact.email));
		}
	}, [contacts, isLoading, isError]);

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
		...(!isPublic
			? pastEmails
					.filter((item) =>
						item.toLowerCase().includes(search.trim().toLowerCase()),
					)
					.map((item) => (
						<Combobox.Option
							value={item}
							key={item}
							active={pills.includes(item)}
						>
							<Group gap="sm">
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
				<PillsInput
					label="Who is this for?"
					onClick={() => combobox.openDropdown()}
				>
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
									} else if (
										event.key === 'Backspace' &&
										search.length === 0
									) {
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
					{options.length > 0 ? (
						options
					) : (
						<Combobox.Empty>Nothing found...</Combobox.Empty>
					)}
				</Combobox.Options>
			</Combobox.Dropdown>
		</Combobox>
	);
};

export { EmailSelector };

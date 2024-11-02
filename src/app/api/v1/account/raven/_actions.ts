'use server';

import Sqids from 'sqids';

export const calc_short_link = async (link_id: number): Promise<string> => {
	const sqids = new Sqids({
		minLength: 10,
		alphabet: 'waU04Tzt9fHQrqSVKdpimLGIJOgb5ZEFxnXM1kBN6cuhsAvjW3Co7l2RePyY8D',
	});
	const new_link = sqids.encode([link_id]);
	return new_link;
};

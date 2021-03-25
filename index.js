"use strict";

const axios = require( "axios" );
const dotenv = require( "dotenv" );
dotenv.config();

function formatCustomId( id ) {
	return `Forum: ${ id }`;
}

async function getDiscussions() {
	try {
		const {
			VANILLA_API_TOKEN: token,
			VANILLA_BASE_URL: baseUrl,
			VANILLA_CATEGORY_ID: categoryId
		} = process.env;

		const dt = new Date();
		dt.setDate( dt.getDate() - 2 );
		const dtFilter = dt.toISOString().substring( 0, 10 );

		const config = {
			method: "get",
			url: `${ baseUrl }/api/v2/discussions?page=1&limit=100&categoryID=${ categoryId }&dateInserted=>${ dtFilter }`,
			headers: {
				Authorization: `Bearer ${ token }`,
				Accept: "application/json",
				"Content-Type": "application/json"
			}
		};

		const res = await axios( config );
		return res.data;
	} catch ( err ) {
		console.log( err );
		return [];
	}
}

async function getCardByCustomId( id ) {
	try {
		const {
			LK_HOST: host,
			LK_USERNAME: username,
			LK_PASSWORD: password
		} = process.env;

		const config = {
			method: "get",
			url: `https://${ host }.leankit.com/io/card/?customId=${ formatCustomId( id ) }`,
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json"
			},
			auth: {
				username, password
			}
		};

		const res = await axios( config );
		return res.data.cards;

	} catch ( err ) {
		console.log( err );
		return [];
	}
}

async function createCard( { title, id, url } ) {
	try {
		const {
			LK_HOST: host,
			LK_USERNAME: username,
			LK_PASSWORD: password,
			LK_BOARD_ID: boardId,
			LK_TYPE_ID: typeId,
			LK_LANE_ID: laneId
		} = process.env;

		const config = {
			method: "post",
			url: `https://${ host }.leankit.com/io/card`,
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json"
			},
			auth: {
				username, password
			},
			data: {
				boardId,
				title,
				typeId,
				laneId,
				customId: formatCustomId( id ),
				externalLink: {
					label: "Forum Post",
					url
				}
			}
		};

		const res = await axios( config );
		return res.data;

	} catch ( err ) {
		console.log( err );
		return "Error: " + err.message;
	}
}

( async () => {
	const discussions = await getDiscussions();
	for( const { discussionID: id, name: title, url } of discussions ) {
		const cards = await getCardByCustomId( id );
		if ( !cards.length ) {
			await createCard( { title, id, url } );
		}
	}
} )();


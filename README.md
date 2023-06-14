<p align="center">
  <a href="" rel="noopener"><img width=200px height=200px src="public/logo.svg" alt="dARchive"></a>
</p>

<h3 align="center">othent-dARchive</h3>

---

<p align="center"> Decentralized Archive (<b>dARchive</b>) is a decentralized application to create an archive of web pages that can always be accessed online even if the original page disappears.
    <br>
</p>

> **Note**
> As this app captures webpage and screenshot using puppeteer and it takes some time to do so and upload it to Arweave. The current free hosting available have a small timeout and it cannot be able to archive a URL with such timeout. So you can setup this app locally and try it until i can host the api somewhere.

## 🧐 About

**dARchive** is a decentralized archiving app that lets you snapshot any webpage anytime to create a digital archive and save it to **[Arweave](https://arweave.org/ 'Arweave')** using **[Othent](https://othent.io/ 'Othent')** so that you can access it forever.

It allows a user to save a webpage HTML and screenshot to the decentralized storage called Arweave. The user can search the stored webpages and can view and download the saved webpages and screenshots. This can be useful if you want to take a 'snapshot' of a page that could change soon: price list, job offer, real estate listing, drunk blog post, etc.

## Setup

```sh
npm install

# or

yarn
```

Rename .example.env.local to .env and update the value for `NEXT_PUBLIC_OTHENT_API_ID`, `BROWSERLESS_API_KEY` and `NEXT_PUBLIC_API_URL`.

- `NEXT_PUBLIC_OTHENT_API_ID` (required): Get it from [Othent](https://othent.io).

- `BROWSERLESS_API_KEY` (optional): If this value is provided [browerless](https://www.browserless.io/) endpoint is used else Chrome browser is required to capture the webpage and screenshot of the URL with puppeteer. This is not required when `NEXT_PUBLIC_API_URL` value is given.

- `NEXT_PUBLIC_API_URL` (optional): The api can be deployed seperately for archiving present [here](https://github.com/pawanpaudel93/othent-dARchive-api/) and provide its URL which might look like for example: <https://archive-api.com/api/v1/archive>. If this value is not provided, then api included in the Next.js application itself is used.

## Development

```sh
npm run dev

# or

yarn dev
```

## Production

```sh
npm run build
npm run start

# or

yarn build
yarn start
```

## 🎈 Usage

1. **Archive**: Users can sign in using their Gmail account, visit the archive page, and enter a URL to create an archive. Then, the html and screenshot of the webpage is uploaded via Othent to Arweave to store it permanently.

2. **My Archives**: Users can view their archived webpages and screenshots.

3. **Search**: Users can search using a URL to retrieve the search results. They can view the saved webpages and screenshots.

## ⛏️ Built Using

- [Othent](https://othent.io) - Web3 transactions with existing traditional social logins.
- [Nextjs](https://nextjs.org/) - Reactjs Web Development Framework
- [Chakra UI](https://chakra-ui.com/) - A simple, modular and accessible component library.
- [single-file-cli](https://github.com/pawanpaudel93/single-file-cli) - Single HTML File Saver

## Author

👤 **Pawan Paudel**

- Github: [@pawanpaudel93](https://github.com/pawanpaudel93)

## 🤝 Contributing

Contributions, issues and feature requests are welcome! \ Feel free to check [issues page](https://github.com/pawanpaudel93/othent-darchive/issues).

## Show your support

Give a ⭐️ if this project helped you!

Copyright © 2023 [Pawan Paudel](https://github.com/pawanpaudel93)

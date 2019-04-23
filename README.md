# deluge-rpc

A simple Deluge-web RPC NodeJs API interface.

[![node](https://img.shields.io/node/v/deluge-rpc.svg)](https://www.npmjs.com/package/deluge-rpc)
[![npm](https://img.shields.io/npm/v/deluge-rpc.svg)](https://www.npmjs.com/package/deluge-rpc)
[![npm bundle size (minified)](https://img.shields.io/bundlephobia/min/deluge-rpc.svg)](https://www.npmjs.com/package/deluge-rpc)
[![license](https://img.shields.io/github/license/huihuimoe/node-deluge-rpc.svg)](https://github.com/huihuimoe/node-deluge-rpc)

## install

You need Nodejs > 8 or lastest version browser to support `class` and `async/await`.

### Node

```bash
npm i deluge-rpc
```

### Browser

It requires `axios` so you should add `axios` first.

```HTML
<script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/deluge-rpc/dist/deluge-rpc.min.js"></script>
<script>
// write your code here
</script>
```

## Usage

Deluge-rpc fully use async/await to write more pretty code.

Example:

```javascript
(async () => {
  // in browser if you alreay have cookie to access rpc, you can ignore password
  const deluge  = new DelugeRPC('https://mydeluge.dev/', 'password')

  // list all available method
  const methods = await deluge.call("system.listMethods")
  console.log(methods)

  // get connect status
  const isConnected = await deluge.call('web.connected')

  if (!isConnected)
    // connect to the first host
    await deluge.connect(0)

  // add torrent
  await deluge.addTorrent('http://example.com/example.torrent', {max_upload_speed: 10240})
  // add torrent url with cookie
  await deluge.addTorrent('http://example.com/example.torrent', {cookie: 'key1: value1; key2: value2'})
  // in Node
  await deluge.addTorrent(fs.readFileSync('./myfile.torrent'))
  // in browser
  await deluge.addTorrent(fileInput.files[0])

  // get torrents status
  const status = await deluge.getTorrentRecord()
  console.log(status)
})()


```

## License

[MIT](LICENSE)

import axios from 'axios'
import * as stream from 'stream'
import * as FormData from 'form-data'
const isNode = typeof stream !== 'undefined'

export default class DelugeRPC {
  /**
   * @constructor
   * @param {string} delugeRpcBaseUrl deluge-web rpc url (without json)
   * @param {string} rpcPassword deluge-web password
   */
  constructor (delugeRpcBaseUrl, rpcPassword) {
    this.msgId = 0
    this.cookie = ''
    if (delugeRpcBaseUrl[delugeRpcBaseUrl.length - 1] !== '/') {
      delugeRpcBaseUrl += '/'
    }
    this.baseUrl = delugeRpcBaseUrl
    this.pass = rpcPassword
  }

  /**
   * make request
   * @param {string} method
   * @param {Array<any>} [params=[]]
   * @returns {Promise<Response>}
   */
  async _makeCall (method, params = []) {
    if (this.msgId === 1024) {
      this.msgId = 0
    }
    const headers = {
      'Content-Type': 'application/json'
    }
    if (isNode) {
      headers['Cookie'] = this.cookie
    }
    return axios.request({
      url: this.baseUrl + 'json',
      method: 'post',
      data: {
        method,
        params,
        id: this.msgId++
      },
      withCredentials: true,
      headers
    })
  }

  /**
   * authorize
   * @returns {Promise<boolean>}
   */
  async auth () {
    const { data: { result: status } } = await this._makeCall('auth.check_session')
    if (status) {
      return true
    }
    const { data, headers } = await this._makeCall('auth.login', [this.pass])
    if (!data.result) {
      throw new Error('Auth failed, does the password valided?')
    }
    this.cookie = headers['set-cookie'][0].split(';')[0]
    return true
  }

  /**
   * call rpc method
   * @param {string} method
   * @param {Array<any>} [params=[]]
   * @returns {Promise<any>}
   */
  async call (method, params = []) {
    return this._makeCall(method, params).then(response => {
      const data = response.data
      if (data.error) {
        throw data.error
      }
      return data.result
    })
  }

  /**
   * connect to a host
   * @param {number | string} [host=0] index or the id of host
   * @returns {Promise<null>}
   */
  async connect (host = 0) {
    if (typeof host === 'number') {
      const hosts = await this.call('web.get_hosts')
      host = hosts[host][0]
    }
    return this.call('web.connect', [host])
  }

  /**
   * get status of all torrents
   * @returns {Promise<any>}
   */
  async getTorrentRecord () {
    await this.auth()
    return this.call('web.update_ui', [
      [
        'distributed_copies',
        'download_payload_rate',
        'eta',
        'is_auto_managed',
        'max_download_speed',
        'max_upload_speed',
        'name',
        'num_peers',
        'num_seeds',
        'progress',
        'queue',
        'ratio',
        'save_path',
        'seeds_peers_ratio',
        'state',
        'time_added',
        'total_done',
        'total_peers',
        'total_seeds',
        'total_uploaded',
        'total_wanted',
        'tracker_host',
        'upload_payload_rate'
      ], {}
    ])
  }

  /**
   * add a torrent
   * @param {string | URL | Buffer | Blob | stream.Readable | Promise<string | URL | Buffer | Blob | stream.Readable> } torrent - path or url or file
   * @param {string | DelugeTorrentConfig} [config] - torrent options or download path
   * @typedef {Object} DelugeTorrentConfig
   * @prop {string} [cookie]
   * @prop {Array<number>} [file_priorities=[]]
   * @prop {boolean} [add_paused=false]
   * @prop {boolean} [compact_allocation=true]
   * @prop {number} [max_connections=-1]
   * @prop {number} [max_download_speed=-1]
   * @prop {number} [max_upload_slots=-1]
   * @prop {number} [max_upload_speed=-1]
   * @prop {boolean} [prioritize_first_last_pieces=false]
   * @prop {string} [download_location]
   * @returns {Promise<boolean>}
   */
  async addTorrent (torrent, config = {}) {
    if (typeof config === 'string') {
      config = {
        download_location: config
      }
    }
    await this.auth()

    // unwrap Promise
    if (torrent instanceof Promise) {
      torrent = await torrent
    }

    // a File, Blob, Buffer or stream.Readable
    if (
      // node env
      (isNode && (torrent instanceof Buffer || torrent instanceof stream.Readable)) ||
      // browser env
      (!isNode && torrent instanceof Blob)
    ) {
      const form = new FormData()
      form.append('file', torrent, 'upload.torrent')
      // upload torrent
      const headers = isNode ? {
        ...form.getHeaders(),
        Cookie: this.cookie
      } : {}
      const { data } = await axios.request({
        url: this.baseUrl + 'upload',
        method: 'post',
        data: form,
        withCredentials: true,
        headers
      })
      if (!data.success) throw new Error('Upload torrents failed.')
      torrent = data.files[0]
    }

    // a URL
    let isURL = false
    try {
      isURL = !!new URL(torrent)
    } catch (e) {}
    if (isURL) {
      torrent = await this.call('web.download_torrent_from_url', [torrent, config.cookie])
      delete config.cookie
    }

    config = {
      path: torrent,
      options: {
        file_priorities: [],
        add_paused: false,
        compact_allocation: true,
        max_connections: -1,
        max_download_speed: -1,
        max_upload_slots: -1,
        max_upload_speed: -1,
        prioritize_first_last_pieces: false,
        ...config
      }
    }

    return this.call('web.add_torrents', [[config]])
  }
}

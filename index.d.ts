import { AxiosPromise } from 'axios'
import * as stream from 'stream'

declare namespace DelugeRPC {
  export interface DelugeTorrentConfig {
    file_priorities?: Array<number>;
    add_paused?: boolean;
    compact_allocation?: boolean;
    download_location?: string;
    max_connections?: number;
    max_download_speed?: number;
    max_upload_slots?: number;
    max_upload_speed?: number;
    prioritize_first_last_pieces?: boolean;
    cookie?: string;
  }

  export interface DelugeTorrentRecord {
    connected: boolean;
    filters?: {
      state: Array<[string, number]>;
      tracker_host: Array<[string, number]>;
    }
    stats?: {
      dht_nodes: number;
      download_protocol_rate: number;
      download_rate: number;
      free_space: number;
      has_incoming_connections: boolean;
      max_download: number;
      max_num_connections: number;
      max_upload: number;
      num_connections: number;
      upload_protocol_rate: number;
      upload_rate: number;
    }
    torrents?: {
      [key: string]: {
        distributed_copies: number;
        download_payload_rate: number;
        eta: number;
        is_auto_managed: boolean;
        max_download_speed: number;
        max_upload_speed: number;
        name: string;
        num_peers: number;
        num_seeds: number;
        progress: number;
        queue: number;
        ratio: number;
        save_path: string;
        seeds_peers_ratio: number;
        state: string;
        time_added: number;
        total_done: number;
        total_peers: number;
        total_seeds: number;
        total_uploaded: number;
        total_wanted: number;
        tracker_host: string;
        upload_payload_rate: number;
      }
    }
  }
}

declare class DelugeRPC {
  constructor(delugeRpcBaseUrl: string, rpcPassword?: string);
  baseUrl: string;
  pass: string;
  cookie: string;
  msgId: number;
  _makeCall<T = any>(method: string, params?: Array<any>): AxiosPromise<T>;
  auth(): Promise<boolean>;
  call<T = any>(method: string, params?: Array<any>): Promise<T>;
  connect(host?: number | string): Promise<null>;
  getTorrentRecord(): Promise<DelugeRPC.DelugeTorrentRecord>;
  addTorrent(torrent: string | URL | Buffer | Promise<Buffer> | ReadableStream | stream.Readable | File | Blob, config?: string | DelugeRPC.DelugeTorrentConfig): Promise<boolean>
}

export = DelugeRPC;

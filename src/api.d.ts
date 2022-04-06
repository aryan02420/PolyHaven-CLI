type assetTypesRes = string[]
type categoryListRes = Record<string, number>
type assetListRes = Record<string, number>
type authorInfo = Record<string, string>
interface assetInfo {
  name: string
  date_published: number
  download_count: number
  authors: string
  donated: boolean | null
  catrgories: string[]
  tags: string[]
}
interface hdriInfo extends assetInfo {
  type: 0
  whitebalance: number | null
  backplates: boolean | null
  evs_cap: number
  coords: [number, number]
}
interface textureInfo extends assetInfo {
  type: 1
  dimensions: [number, number]
}
interface modelInfo extends assetInfo {
  type: 2
}
type unknownAssetInfo = hdriInfo | textureInfo | modelInfo
interface unknownAsset {
  [name: string]: unknownAssetInfo
}
interface fileUrl {
  url: string
  md5: string
  size: number
}
interface fileUrlWithInclude extends fileUrl {
  include: {
    [path: string]: fileUrl
  }
}
interface hdriFile {
  hdri: {
    [resolution: string]: {
      [format: string]: fileUrl
    }
  }
  backplates: {
    [image: string]: {
      [format: string]: fileUrl
    }
  } | null
  colorchart?: fileUrl
  tonemapped?: fileUrl
}
interface textureFile {
  blend: {
    [resolution: string]: {
      blend: fileUrlWithInclude
    }
  }
  gltf: {
    [resolution: string]: {
      gltf: fileUrlWithInclude
    }
  }
  [map: string]: {
    [resolution: string]: {
      [format: string]: fileUrl
    }
  }
}
interface modelFile extends textureFile {
  fbx: {
    [resolution: string]: {
      [format: string]: fileUrl
    }
  }
}
type unknownFile = hdriFile | textureFile | modelFile

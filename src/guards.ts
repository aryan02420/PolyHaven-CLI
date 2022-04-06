export function isHdriFile(file: unknownFile): file is hdriFile {
  return (file as hdriFile).hdri !== undefined
}

export function isTextureFile(file: unknownFile): file is textureFile {
  return (file as textureFile).fbx === undefined
}

export function isModelFile(file: unknownFile): file is modelFile {
  return (file as modelFile).fbx !== undefined
}

export function isFileUrl(file: any): file is fileUrl {
  return (file as fileUrl).url !== undefined
}

export function isFileUrlwithInclude(file: any): file is fileUrlWithInclude {
  return isFileUrl(file) && (file as fileUrlWithInclude).include !== undefined
}
// Reduz a foto no navegador antes do envio: menos espera no celular e menos
// espaço/tráfego no Supabase (o plano gratuito tem 1 GB de arquivos)
export async function resizeImage(
  file: File,
  maxSize = 512,
  quality = 0.85,
): Promise<Blob> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height))
  const width = Math.round(bitmap.width * scale)
  const height = Math.round(bitmap.height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  if (!context) {
    throw new Error('Não foi possível processar a imagem')
  }
  context.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob
          ? resolve(blob)
          : reject(new Error('Não foi possível processar a imagem')),
      'image/jpeg',
      quality,
    )
  })
}

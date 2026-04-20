import drive from '@adonisjs/drive/services/main'
import { v4 as uuidv4 } from 'uuid'
import { posix } from 'node:path'

export interface ValidatedImage {
    ext: string
    data: string
    mimeType: string
}

const ALLOWED_MIME_TYPES: Record<string, string> = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg',
    'image/gif': 'gif',
    'image/webp': 'webp',
}

export default class ImageUpload { 
    private constructor() {}

    public static validateBase64Image(base64String: string): ValidatedImage {
        const commaIndex = base64String.indexOf(',')
        
        if (commaIndex === -1 || !base64String.startsWith('data:')) {
            throw new Error('Invalid Base64 image format.')
        }

        const metadata = base64String.substring(5, commaIndex)
        const [mimeType, encoding] = metadata.split(';')

        if (encoding !== 'base64') {
            throw new Error('Image data is not base64 encoded.')
        }

        const fileExtension = ALLOWED_MIME_TYPES[mimeType]

        if (!fileExtension) {
            throw new Error(`Unsupported image type: ${mimeType}`)
        }

        return {
            ext: fileExtension,
            data: base64String.substring(commaIndex + 1),
            mimeType
        }
    }

    public static async save(image: ValidatedImage, destinationPath: string, maxSizeMb?: number): Promise<string> {
        
        const buffer = Buffer.from(image.data, 'base64')
    
        if (maxSizeMb) {
            const maxSizeBytes = maxSizeMb * 1024 * 1024
            if (buffer.length > maxSizeBytes) {
                throw new Error(
                    `File size (${(buffer.length / (1024 * 1024)).toFixed(2)}MB) exceeds maximum allowed size (${maxSizeMb}MB).`
                )
            }
        }
        
        const fileName = `${uuidv4()}.${image.ext}`        
        
        const filePath = posix.join('images', destinationPath, fileName)

        const disk = drive.use()

        await disk.put(filePath, buffer, { contentType: image.mimeType })

        try {
            return await disk.getUrl(filePath)
        } catch (error) {
            return posix.join('/uploads', filePath)
        }
    }
}
import { type SchemaTypeDefinition } from 'sanity'

import post from '../schemas/post'
import author from '../schemas/author'

import settings from '../schemas/settings'

import seo from '../schemas/seo'




export const schema: { types: SchemaTypeDefinition[] } = {
  types: [post, author, settings, seo],
}


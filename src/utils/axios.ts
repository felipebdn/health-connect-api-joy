import { env } from '@/env'
import axios from 'axios'

export const sendEmail = axios.create({ baseURL: env.BASE_URL_EMAILJS })

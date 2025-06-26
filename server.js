import express from 'express'
import cors from 'cors'
import axios from 'axios'
import { configDotenv } from "dotenv"

configDotenv()

const client = axios.create({
  baseURL: `https://${process.env.NAI_HOST}/api/v1`,
  headers: {
    Authorization: `Bearer ${process.env.API_KEY}`
  }
})

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors({
  origin: ['*']
}))

app.get('/models', async (req, res) => {
  res.json((await client.get('/models')).data)
})

app.post('/completions', async (req, res, next) => {
  try {
    const response = await client.post('/chat/completions', {
      model: req.body.model,
      messages: req.body.messages,
      max_tokens: 4096,
      stream: true
    }, {
      responseType: 'stream',
      headers: {
        'Accept': 'text/event-stream',
      },
      adapter: 'fetch'
    })

    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')

    const stream = response.data
    const reader = stream.pipeThrough(new TextDecoderStream()).getReader()

    while (true) {
      const { value, done } = await reader.read()
      if (done) {
        res.end()
        break
      }

      res.write(value)
    }
  } catch (err) {
    next(err)
  }
})

app.listen(3000)
import http from "http"
import https from "https"

type Task<T = any> = () => Promise<T>
type JSON = Record<string, any> | Record<string, any>[]

class Queue {
  constructor(
    private concurrency: number,
    private tasks: Task[] = [],
    private processingTasks: number = 0,
  ) {}

  push(task: Task) {
    this.tasks.push(task)

    if (this.processingTasks < this.concurrency) {
      this.processQueue() // we don't await promise here for purpose!
    }
  }

  private async processQueue() {
    if (this.processingTasks >= this.concurrency) {
      return
    }

    const task = this.tasks.shift()

    if (!task) {
      return
    }

    try {
      this.processingTasks++
      await task()
    } catch (err) {
      console.error(err)
    } finally {
      this.processingTasks--
      this.processQueue() // we don't await promise here for purpose!
    }
  }
}

const fetchURL = <T = string | JSON>(url: string): Promise<T> =>
  new Promise<T>((resolve, reject) => {
    const request = url.startsWith("https") ? https : http

    request
      .get(url, (res) => {
        let data = ""

        res
          .on("data", (chunk) => {
            data += chunk
          })
          .on("end", () => {
            if (res.headers["content-type"] === "application/json") {
              resolve(JSON.parse(data))
            } else {
              resolve(data as T)
            }
          })
      })
      .on("error", (err) => {
        reject(err)
      })
  })

const urls = [
  "https://jsonplaceholder.typicode.com/todos/1",
  "https://jsonplaceholder.typicode.com/todos/2",
  "https://jsonplaceholder.typicode.com/users/3",
  "https://jsonplaceholder.typicode.com/todos/4",
  "https://jsonplaceholder.typicode.com/todos/5",
]

const queue = new Queue(3)
const handler = (url: string) => async () => {
  try {
    const data = await fetchURL(url)
    console.log(`Fetched data from ${url}:`)
    console.log(data)
  } catch (err: any) {
    console.error(`Error fetching ${url}:`)
    console.error(err.message)
  } finally {
    console.log()
  }
}

urls.forEach((url) => {
  queue.push(handler(url))
})

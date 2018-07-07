const w : number = window.innerWidth, h : number = window.innerHeight, NODES = 5
class LinkedTriExpStage {
    canvas : HTMLCanvasElement = document.createElement('canvas')

    context : CanvasRenderingContext2D

    lte : LinkedTriExp = new LinkedTriExp()

    animator : Animator = new Animator()

    constructor() {
        this.initCanvas()
    }

    initCanvas() {
        this.canvas.width = w
        this.canvas.height = h
        this.context = this.canvas.getContext('2d')
        document.body.appendChild(this.canvas)
    }

    render() {
        this.context.fillStyle = '#212121'
        this.context.fillRect(0, 0, w, h)
        this.lte.draw(this.context)
    }

    handleTap() {
        this.canvas.onmousedown = () => {
            this.lte.startUpdating(() => {
                this.animator.start(() => {
                    this.render()
                    this.lte.update(() => {
                        this.animator.stop()
                    })
                })
            })
        }
    }

    static init() {
        const stage : LinkedTriExpStage = new LinkedTriExpStage()
        stage.render()
        stage.handleTap()
    }
}

class State {
    scale : number = 0

    dir : number = 0

    prevScale : number = 0

    update(stopcb : Function) {
        this.scale += 0.1 * this.dir
        if (Math.abs(this.scale - this.prevScale) > 1) {
            this.scale = this.prevScale + this.dir
            this.dir = 0
            this.prevScale = this.scale
            stopcb()
        }
    }

    startUpdating(startcb : Function) {
        if (this.dir == 0) {
            this.dir = 1 - 2 * this.prevScale
            startcb()
        }
    }
}

class Animator {
    animated : boolean = false

    interval : number

    start(cb) {
      if (!this.animated) {
          this.animated = true
          this.interval = setInterval(() => {
              cb()
          }, 50)
      }
    }

    stop() {
        if (this.animated) {
            this.animated = false
            clearInterval(this.interval)
        }
    }
}

class TriExpNode {

    state : State = new State()

    next : TriExpNode

    prev : TriExpNode

    constructor(private i : number) {
        this.addNeighbor()
    }

    addNeighbor() {
        if (this.i < NODES - 1) {
            this.next = new TriExpNode(this.i + 1)
            this.next.prev = this
        }
    }

    draw(context : CanvasRenderingContext2D) {
        context.lineWidth = Math.min(w, h) / 60
        context.lineCap = 'round'
        context.strokeStyle = '#FF9800'
        const i1 : number = this.i%2, i2 : number = (this.i + 1) % 2
        const gap = w / NODES
        context.save()
        context.translate(this.i * gap, h/2)
        const scales : Array<number> = [Math.min(0.5, this.state.scale), Math.min(0.5, Math.max(0, this.state.scale - 0.5))]
        const hGap : number = (i1 * scales[0] + (1 - scales[1]) * i2) * gap/2
        context.beginPath()
        context.moveTo(gap * scales[i1], 0)
        context.lineTo(gap * scales[i2], hGap)
        context.lineTo(gap * scales[i2], -hGap)
        context.stroke()
        context.restore()
    }

    update(stopcb : Function) {
        this.state.update(stopcb)
    }

    startUpdating(startcb : Function) {
        this.state.startUpdating(startcb)
    }

    getNext(dir : number, cb : Function) {
        var curr = this.prev
        if (dir == 1) {
            curr = this.next
        }
        if (curr) {
            return curr
        }
        cb()
        return this
    }
}

class LinkedTriExp {

    curr : TriExpNode = new TriExpNode(0)

    dir : number = 1

    draw(context : CanvasRenderingContext2D) {
        this.curr.draw(context)
    }

    update(stopcb : Function) {
        this.curr.update(() => {
            this.curr = this.curr.getNext(this.dir, () => {
                this.dir *= -1
            })
            stopcb()
        })
    }

    startUpdating(startcb : Function) {
        this.curr.startUpdating(startcb)
    }
}

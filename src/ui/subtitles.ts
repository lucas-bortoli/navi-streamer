type SubSegment = {
    id: number,
    start: number,
    end: number,
    text: string
}

class SRT {
    public originalFile: string
    public segments: SubSegment[] = []
    public sub_offset: number = 0
    constructor(srtFileContents: string) {
        this.originalFile = srtFileContents
        console.log(srtFileContents)
        //@ts-expect-error
        this.segments = parseSRT(srtFileContents)
    }

    public getSubtitleAtTimestamp(ts: number): SubSegment[] {
        const subs = []

        for (const segment of this.segments) {
            if ((ts + this.sub_offset) > segment.start && (ts + this.sub_offset) < segment.end)
                subs.push(segment)
        }

        return subs
    }
}

//@ts-ignore
window.libSRT = SRT
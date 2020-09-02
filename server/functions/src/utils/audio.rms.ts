
export class AudioRMSAnalyzer {

    private _result = 0;

    private _channels: number = 0;
    private _channelSqrSum: number[] = [];
    private _channelLength: number[] = [];

    get result() { return this._result; }

    setChannelsNumber(c: number) {
        if (c !== 1 && c !== 2) {
            throw new Error('supported channels count: 1, 2');
        }

        this._channels = c;
        this._channelSqrSum.length = c;
        this._channelLength.length = c;
        for (let i = 0; i < c; ++i) {
            this._channelSqrSum[i] = 0;
            this._channelLength[i] = 0;
        }
    }

    addValue(v: number, index: number) {
        this._channelLength[index]++;
        this._channelSqrSum[index] += v * v;
    }

    finalize() {
        this._result = 0;

        if (this._channels > 0) {
            for (let i = 0; i < this._channels; ++i) {
                const sqrSum = this._channelSqrSum[i];
                const count = this._channelLength[i];

                if (count > 0) {
                    this._result += Math.sqrt(sqrSum / count);
                }
            }

            this._result = this._result / this._channels;
        }

        return this;
    }

    calculateFull(channels: Float32Array[] | number[][]) {

        this.setChannelsNumber(channels.length);

        for (let c = 0; c < channels.length; ++c) {
            const cc = channels[c];
            for (let i = 0; i < cc.length; ++i) {
                const v = cc[i];
                this.addValue(v, c);
            }
        }

        return this.finalize();
    }
}

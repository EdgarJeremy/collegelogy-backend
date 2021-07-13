export class RabinKarp {
    private txt1?: string;
    private txt2?: string;

    private gram: number = 3;
    private base: number = 13;

    constructor(txt1: string, txt2: string) {
        this.txt1 = txt1;
        this.txt2 = txt2;
    }

    getPercentage() {
        const { txt1, txt2 } = this;
        const pText1 = this.preprocess(txt1!);
        const tText1 = this.tokenize(pText1);
        const hText1 = tText1.map((t) => this.hash(t, pText1.length, this.base));

        const pText2 = this.preprocess(txt2!);
        const tText2 = this.tokenize(pText2);
        const hText2 = tText2.map((t) => this.hash(t, pText2.length, this.base));

        let same = 0;
        const a = hText1.length < hText2.length ? hText1 : hText2;
        const b = hText1.length > hText2.length ? hText1 : hText2;
        for (let i = 0; i < a.length; i++) {
            if (b.indexOf(a[i]) !== -1) {
                same++;
            }
        }
        const similarity = (2 * same / (hText1.length + hText2.length)) * 100;
        return similarity;
    }

    private preprocess(txt: string) {
        return txt.replace(/[^a-zA-Z]/g, '').trim().toLowerCase();
    }

    private tokenize(txt: string) {
        const n = txt.length;
        const splitted = [];
        if (n < this.gram) {
            splitted.push(txt);
        } else {
            for (let i = 0; i <= n - this.gram; i++) {
                splitted.push(txt.substr(i, this.gram));
            }
        }
        return splitted;
    }

    private hash(txt: string, inputLength: number, base: number) {
        const n = txt.length;
        let hash = 0;
        for (let i = 0; i < n; i++) {
            const ord = txt.charCodeAt(i);
            hash += ord * Math.pow(base, n - (i + 1));
        }
        return hash;
    }
}
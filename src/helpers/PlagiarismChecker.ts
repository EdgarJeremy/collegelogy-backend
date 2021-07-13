import ModelFactoryInterface from "../models/typings/ModelFactoryInterface";
import { RabinKarp } from "./RabinKarp";

export class PlagiarismChecker {
    models: ModelFactoryInterface;

    constructor(models: ModelFactoryInterface) {
        this.models = models;
    }

    async check() {
        const now = new Date();
        const tasks = await this.models.Task.findAll({
            where: {
                checked: false,
                due_date: { $lte: now }
            }
        });
        for (let i = 0; i < tasks.length; i++) {
            const task = tasks[i];
            const documents = await task.getDocuments();
            console.log(documents.map((d) => d.participant_id));
            for (let j = 0; j < documents.length; j++) {
                const document = documents[j];
                const otherDocuments = documents.filter((d) => d.id !== document.id);
                console.log('For : ', document.participant_id);
                for (let t = 0; t < otherDocuments.length; t++) {
                    const a = document;
                    const b = otherDocuments[t];
                    const rabinKarp = new RabinKarp(a.content, b.content);
                    const percentage = rabinKarp.getPercentage();
                    this.models.Difference.create({
                        a_id: a.id,
                        b_id: b.id,
                        percentage,
                        task_id: task.id
                    });
                    console.log(`${a.participant_id} --> ${b.participant_id} = ${rabinKarp.getPercentage()}`);
                }
            }
            await task.update({ checked: true });
        }
    }
}
import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
    res.status(200).send("it's alive!");
});

app.post('/client', (req, res) => {
    const data = req.body;
    if (!data.id) {
        res.status(400).send({
            message: 'Missing id field',
        });
    } else {
        res.status(201).send({
            message: 'Created',
            id: data.id
        });
    }
});

app.get('/client/:clientId', (req, res) => {
    res.status(200).send({
        id: req.params.clientId,
    });
});

interface MeasurementBody {
    clientID: string,
    data: {
        name: string,
        value: number,
        date: number,
        source: string
    },
}

type CreateMeasurementArgs = {
    uid: string,
    value: number,
    name: string,
    source: string,
    date: number,
}

app.post('/measurement', (req, res) => {
    const { clientID, data }: Partial<MeasurementBody> = req.body;
    if (!data) {
        res.status(400).send({
            message: "Missing data object"
        })
    } else {
        const { name, value, date, source } = data;
        if (!clientID || !date || !value || !name || !source) {
            res.status(400).send({
                message: "Missing data fields"
            })
        } else if (Number.isNaN(data.date)) {
            res.status(400).send({
                message: "date must be a number"
            })
        } else {
            const me: CreateMeasurementArgs = {
                date,
                uid: clientID,
                source,
                name,
                value,
            }
            res.status(201).send({
                message: 'Created',
                data: me
            });
        }
    }
});

const port = parseInt(process.env.BACKEND_API_PORT, 10);
const host = process.env.API_ADDR;

const server = app.listen(port, host, () => {
    console.log(`Mock app listening at http://${host}:${port}`);
});

process.on('SIGINT', async () => {
    server.close(() => {
        console.log('\n\nBye.');
        process.exit();
    });
});
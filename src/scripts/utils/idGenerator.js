
export default function randomId() {
    return Math.random().toString(36).replace(/[^a-z]+/g, '').substr(2, 10);
}
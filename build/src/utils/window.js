var win;
if (typeof window !== 'undefined') {
    win = window;
}
else if (typeof self !== 'undefined') {
    win = self;
}
else {
    win = {};
}
export default win;

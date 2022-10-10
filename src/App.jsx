import { useEffect, useState } from 'react';
import protobuf from 'protobufjs';

const { Buffer } = require('buffer/');

const emojis = {
  '': '',
  up: '🚀',
  down: '💩',
};

function App() {
  const [stock, setStock] = useState(null);
  const [direction, setDirection] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ws = new WebSocket('wss://streamer.finance.yahoo.com');
    protobuf.load('./YPricingData.proto', (error, root) => {
      const Yaticker = root.lookupType('yaticker');

      ws.onopen = function open() {
        console.log('connected');
        ws.send(
          JSON.stringify({
            subscribe: [(params.get('symbol') || 'GME').toUpperCase()],
          }),
        );
      };

      ws.onclose = function close() {
        console.log('disconnected');
      };

      ws.onmessage = function incoming(message) {
        const next = Yaticker.decode(Buffer.from(message.data, 'base64'));
        setStock(curr => {
          if (curr) {
            const nextDirection =
              curr.price < next.price
                ? 'up'
                : curr.price > next.price
                ? 'down'
                : '';
            if (nextDirection) {
              console.log(nextDirection);
              setDirection(nextDirection);
            }
          }
          return next;
        });
      };
    });
  }, []);

  return (
    <div className="App">
      <div className="resultMarquee">
        {stock && (
          <h2 className={direction}>
            {stock.id}:{' '}
            <span>
              {' '}
              ${stock.price.toFixed(2)} {emojis[direction]}
            </span>
          </h2>
        )}
      </div>
    </div>
  );
}

export default App;

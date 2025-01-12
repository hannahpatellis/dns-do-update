const https = require('https');
require('dotenv').config();

const ipAPI = 'https://api.ipify.org?format=json';
const domain = process.env.DO_DOMAIN;
const recordNumber = process.env.DO_DOMAIN_RECORD;
const token = process.env.DO_TOKEN;

let currentIP = false;

const getCurrentIP = () => {
  https.get(ipAPI, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
      console.log(`BODY: ${chunk}`);
      chunk = JSON.parse(chunk);
      console.log(`YOUR IP IS: ${chunk.ip}`);
      currentIP = chunk.ip;

      initialQuery();

    });
    res.on('end', () => {
      console.log('No more data in response for getCurrentIP().');
    });
  }).on('error', (e) => {
    console.error(`Problem with getCurrentIP() request: ${e.message}`);
  });
}

const initialQuery = () => {
  const options = { 
    host: 'api.digitalocean.com',
    path: `/v2/domains/${domain}/records/${recordNumber}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    }
  };

  const iqReq = https.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
      console.log(`BODY: ${chunk}`);
      chunk = JSON.parse(chunk);
      console.log(`CURRENT RECORD IP IS: ${chunk.domain_record.data}`);

      if(chunk.domain_record.data == currentIP) {
        console.log("IP addresses match.");
      } else if(chunk.domain_record.data != currentIP) {
        updateQuery();
      }

    });
    res.on('end', () => {
      console.log('No more data in response for initialQuery().');
    });
  });
    
  iqReq.on('error', (e) => {
    console.error(`Problem with initialQuery() request: ${e.message}`);
  });

  iqReq.end();
}

const updateQuery = () => {
  const options = { 
    host: 'api.digitalocean.com',
    path: `/v2/domains/${domain}/records/${recordNumber}`,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    }
  };
  const payload = {
    'type': 'A',
    'data': currentIP
  };

  const uqReq = https.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
      console.log(`BODY: ${chunk}`);
    });
    res.on('end', () => {
      console.log('No more data in response for updateQuery().');
    });
  });
    
  uqReq.on('error', (e) => {
    console.error(`Problem with updateQuery() request: ${e.message}`);
  });

  uqReq.write(JSON.stringify(payload));

  uqReq.end();
}

const readFile = () => {
  console.log("Read file");
}

const writeFile = () => {
  console.log("Write file");
}

getCurrentIP();
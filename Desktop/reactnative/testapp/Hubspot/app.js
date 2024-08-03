const axios = require('axios');

const GET_URL = 'https://candidate.hubteam.com/candidateTest/v3/problem/dataset?userKey=bd43094b19280ea1c93697fe0afa';
const POST_URL = 'https://candidate.hubteam.com/candidateTest/v3/problem/result?userKey=bd43094b19280ea1c93697fe0afa';
const getData = async ()=>{
    try{
        const response = await axios.get(GET_URL);
        console.log('data fetched: ', response.data);
        return response.data;

    }catch(error){
        console.error('Error fetching data: ', error);

    }
};



function processCalls(calls) {
    const results = Object.keys(calls).map(customerId=>{
        const customerCalls = calls[customerId];
        const callDurations = customerCalls.map(call=>call.endTimestamp - call.startTimestamp);
        const totalDuration = callDurations.reduce((acc, duration)=>acc + duration, 0);
const averageDuration = totalDuration/customerCalls.length;
return{
    customerId,
    totalDuration,
    averageDuration
};
    });
    return results;
}
const postData = async(results)=>{
    try{
        const response = await axios.post(POST_URL, data);
    
        console.log('Post response:', response.status);
    
    }catch(error){
        console.error('Error posting data:', error);
    
    }
    
    };
const run = async() =>{
    const data = await getData();
    if(data && data.calls){
        const processedData = processCalls(data.calls);
        await postData({customerId:data.customerId, results: processedData});

    }
};
run();
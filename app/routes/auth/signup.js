const axios = require('axios');

module.exports = async (req, res) => {
  const { cnic } = req.body;

  console.log('Cnic:', cnic);
  if (!cnic) return res.send({ status: 'error', msg: 'cnic is required!' });

  try {
    const response = await axios({
      method: 'post',
      url: 'https://5etx658ey2.execute-api.us-east-1.amazonaws.com/fbr-auth',
      data: {
        userId: cnic,
      },
    });

    const requireId = response.requireID;

    const collectResponse = collectApi(requireId);

    console.log(response);
  } catch (e) {
    console.log(e);
    return res.send({ status: 'error', msg: 'Signup Failed' });
  }

  return res.send('asdfafsd');
};

const collectApi = (token, starttime = null) => {
  if (time) return axios.get;
};

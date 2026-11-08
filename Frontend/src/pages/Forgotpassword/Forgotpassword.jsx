
import React from 'react'
import  { useState } from 'react'
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import './Forgotpassword.css'
import axiosClient from '../../utils/axiosClient.js';
import { Link, useNavigate } from 'react-router-dom';



const Forgotpassword = () => {
    const navigate  = useNavigate()
     const [userDetails,SetuserDetails] = useState({
        
        email:null,
        OTP :null,
        Newpassword :null
    })

    const [otpSentStatus,setotpSentStatus] = useState(false)
    const [otpVerified,setOtpverified] = useState(false)


    const updateFieldData = (FieldName,newValue)=>{
    SetuserDetails(prevDetails=>({...prevDetails,[FieldName]:newValue}))

}



const submitOTP = async()=>{
    try{  let response = await axiosClient.post("/forgot-password",{email:userDetails.email})
   console.log("Line 34",response.data)
   if(response.status==200){

       setotpSentStatus(true)
   }
}catch(err){
    alert('ERROR:Sending OTP')
}
  

}

const verifyOtp = async()=>{
  try{
      let response = await axiosClient.post("/verify-otp",{email:userDetails.email,OTP:userDetails.OTP})
      console.log("Line 49:",response.data)
       setOtpverified(true)

  }
  catch(err){

    console.log("Problem in verifying OTP")

  }
}

const setNewPassword = async()=>{
  try{
      let response = await axiosClient.post("/update-newPassword",{email:userDetails.email,Newpassword:userDetails.Newpassword})
  console.log("Line 62: ",response.data)
   
    alert("New Password Updated")
    navigate("/login")
  
  }catch(err){
    console.log(err)
    alert("Error: While Update the Password")

  }
}


  return (
    <div className='d-flex' style={{height:'100vh'}}>
        <div className='signup-left-half w-50 border-1 border-primary' style={{maxHeight:'100%',overflow:'hidden'}}>
            <img src="/auth-cover.jpg" alt="authentication Cover Image" style={{width:'100%'}} />
        </div>
        <div className='signup-right-half w-50 border border-1 border-danger d-flex align-items-center justify-content-center'>
            <div className=' w-75'>
            <h1>Forgot Password</h1>
             <Form>
     
      <Form.Group className="mb-3" controlId="formBasicEmail">
        <Form.Label>Email address</Form.Label>
        <Form.Control disabled={otpSentStatus} type="email" placeholder="Enter email" className='form-field' value={userDetails.email} onChange={(e)=>{updateFieldData('email',e.target.value)}} />
        <Form.Text className="text-muted">
          We'll never share your email with anyone else.
        </Form.Text>
      </Form.Group>

      
      {
        otpSentStatus==false?  <Button variant="primary" type="button" className='' onClick={()=>{submitOTP()}}>
        Send OTP
      </Button> : <><Form.Group className="mb-3" controlId="formBasicEmail">
        <Form.Label>Enter OTP</Form.Label>
        <Form.Control  disabled={otpVerified}  type="text" placeholder="Enter the otp we have sent" className='form-field' value={userDetails.OTP} onChange={(e)=>{updateFieldData('OTP',e.target.value)}} />
        </Form.Group>
        {!otpVerified? <Button onClick={verifyOtp}>Verify OTP</Button>:<>

        <Form.Group className="mb-3" controlId="formBasicPassword">
        <Form.Label> New Password</Form.Label>
        <Form.Control type="password" placeholder="Enter Your NewPassword" className='form-field' value={userDetails.Newpassword} onChange={(e)=>{updateFieldData('Newpassword',e.target.value)}} />
      </Form.Group>
      <Button onClick={setNewPassword}> Set New Password</Button>


        </>
        }
       </>

      }
      
     
      
    </Form>
   
    </div>
        </div>
    </div>
  )
}

export default Forgotpassword

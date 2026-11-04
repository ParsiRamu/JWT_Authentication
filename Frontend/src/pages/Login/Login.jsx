
import React, { useState } from 'react'
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import './Login.css'
import axiosClient from '../../utils/axiosClient.js';

const Login = () => {
    const [userDetails,SetuserDetails] = useState({
        
        email:null,
        password:null
    })

const updateFieldData = (FieldName,newValue)=>{
    SetuserDetails(prevDetails=>({...prevDetails,[FieldName]:newValue}))

}

const submitSignupForm = async ()=>{
    // console.log("USER: ",userDetails)

     try {
        const response = await axiosClient.post(
            "/user-login",
            userDetails
        );

        console.log("Login Response:", response.data);
        if(response.status==200){
          alert("user loggedIn sucessfully")
        }
        

    } catch (error) {
       alert("invalid Credentials")
        console.log("Status:", error.response?.status);
        console.log("Error:", error.response?.data);
    }
}
  return (
    <div className='d-flex' style={{height:'100vh'}}>
        <div className='signup-left-half w-50 border-1 border-primary' style={{maxHeight:'100%',overflow:'hidden'}}>
            <img src="/auth-cover.jpg" alt="authentication Cover Image" style={{width:'100%'}} />
        </div>
        <div className='signup-right-half w-50 border border-1 border-danger d-flex align-items-center justify-content-center'>
            <div className=' w-75'>
            <h1>Login</h1>
             <Form>
     
      <Form.Group className="mb-3" controlId="formBasicEmail">
        <Form.Label>Email address</Form.Label>
        <Form.Control type="email" placeholder="Enter email" className='form-field' value={userDetails.email} onChange={(e)=>{updateFieldData('email',e.target.value)}} />
        <Form.Text className="text-muted">
          We'll never share your email with anyone else.
        </Form.Text>
      </Form.Group>

      <Form.Group className="mb-3" controlId="formBasicPassword">
        <Form.Label>Password</Form.Label>
        <Form.Control type="password" placeholder="Password" className='form-field' value={userDetails.password} onChange={(e)=>{updateFieldData('password',e.target.value)}} />
      </Form.Group>
      
      <Button variant="primary" type="button" className='w-100' onClick={()=>{submitSignupForm()}}>
        Login
      </Button>
      
    </Form>
    <p>Don't have Account? <a href="#" style={{textDecoration:'underline'}}>Signup</a></p>
    </div>
        </div>
    </div>
  )
}

export default Login

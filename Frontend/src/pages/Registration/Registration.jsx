
import React, { useState } from 'react'
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import './Registration.css'
import axiosClient from '../../utils/axiosClient.js';
import { Link } from 'react-router-dom';

const Signup = () => {
    const [userDetails,SetuserDetails] = useState({
        name:null,
        email:null,
        password:null
    })

const updateFieldData = (FieldName,newValue)=>{
    SetuserDetails(prevDetails=>({...prevDetails,[FieldName]:newValue}))

}

const submitSignupForm = async ()=>{
    // console.log("USER: ",userDetails)

    const response  = await axiosClient.post("/register-new-user",userDetails);
    console.log(response)

}
  return (
    <div className='d-flex' style={{height:'100vh'}}>
        <div className='signup-left-half w-50 border-1 border-primary' style={{maxHeight:'100%',overflow:'hidden'}}>
            <img src="/auth-cover.jpg" alt="authentication Cover Image" style={{width:'100%'}} />
        </div>
        <div className='signup-right-half w-50 border border-1 border-danger d-flex align-items-center justify-content-center'>
            <div className=' w-75'>
            <h1>SignUp</h1>
             <Form>
      <Form.Group className="mb-3" controlId="formBasicEmail">
        <Form.Label>Name</Form.Label>
        <Form.Control type="email" placeholder="Enter your name" className='form-field' value={userDetails.name} onChange={(e)=>{updateFieldData('name',e.target.value)}} />
        
      </Form.Group>
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
        Signup
      </Button>
      
    </Form>
    <p>Already account?
      <Link to={"/login"}>
      Signin
      </Link>
      </p>
    </div>
        </div>
    </div>
  )
}

export default Signup

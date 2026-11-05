import './App.css'
import { Route, Routes } from 'react-router-dom'
// import Signup from './pages/Registration/Registration'
import Login from './pages/Login/Login'
import Signup from './pages/Registration/Registration'
import Forgotpassword from './pages/Forgotpassword/Forgotpassword'



function App() {
  

  return (
    <>
     <Routes>
      <Route path='/login' element={<Login />}/>
      <Route path='/' element={<Signup />}/>
      <Route path='/forgot-password' element={<Forgotpassword />}/>
      
     </Routes>
     
    </>
  )
}

export default App

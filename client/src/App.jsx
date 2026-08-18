import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import axios from 'axios'
import { useDispatch } from 'react-redux'

import Home from './pages/Home'
import Auth from "./pages/Auth"
import InterviewPage from './pages/InterviewPage'
import InterviewReport from './pages/InterviewReport'
import InterviewHistory from './pages/InterviewHistory'
import Pricing from './pages/Pricing'

import { setUserData } from './redux/userSlice'

export const ServerUrl = "https://interviewiq-u9qx.onrender.com"

function App() {

  const dispatch = useDispatch()

  useEffect(() => {

    const getUser = async () => {
      try {

        const result = await axios.get(
          ServerUrl + "/api/user/current-user",
          { withCredentials: true }
        )

        dispatch(setUserData(result.data))

      } catch (error) {
        console.log(error)
        dispatch(setUserData(null))
      }
    }

    getUser()

  }, [])

  return (
    <Routes>

      <Route path='/' element={<Home />} />

      <Route path='/auth' element={<Auth />} />

      <Route path='/interview' element={<InterviewPage />} />

      <Route path='/history' element={<InterviewHistory />} />

      <Route path='/pricing' element={<Pricing />} />

      <Route path='/report/:id' element={<InterviewReport />} />

    </Routes>
  )
}

export default App

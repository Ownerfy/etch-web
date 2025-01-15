import {useNavigate} from "react-router-dom"

export const Page404 = () => {
  const navigate = useNavigate()

  const handleHomeClick = () => {
    navigate("/")
  }

  return (
    <section className="Page404-root">
      <h1>
        404
        <br></br>
        Oops! The page you are looking for could not be found.
      </h1>
      <button onClick={handleHomeClick} className="btn btn-primary large">
        Go back to homepage
      </button>
    </section>
  )
}

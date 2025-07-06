import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Axios from "axios";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const handleLogin = async (values) => {
    try {
      const response = await Axios.post("http://localhost:3001/auth/login", {
        email: values.email,
        password: values.password,
      });

      const token = response.data.token;
      localStorage.setItem("token", token);

      const payload = JSON.parse(atob(token.split('.')[1]));
      const tipo = payload.tipo;

      if (tipo === "cliente") {
        navigate("/homepage");
      } else if (tipo === "restaurante") {
        navigate("/restaurante/home");
      } else {
        alert("Tipo de usuário desconhecido.");
      }

    } catch (err) {
      alert("Email ou senha incorretos!");
    }
  };

  const validationSchema = Yup.object().shape({
    email: Yup.string().email("Email inválido").required("Campo obrigatório"),
    password: Yup.string().min(8, "Mínimo 8 caracteres").required("Campo obrigatório"),
  });

  return (
    <div className="container">
      <h1>Login</h1>
      <Formik initialValues={{ email: "", password: "" }} onSubmit={handleLogin} validationSchema={validationSchema}>
        <Form className="login-form">
          <div className="login-form-group">
            <Field name="email" className="form-field" placeholder="Email" />
            <ErrorMessage name="email" component="span" className="form-error" />
          </div>
          <div className="login-form-group">
            <Field name="password" className="form-field" placeholder="Senha" type="password" />
            <ErrorMessage name="password" component="span" className="form-error" />
          </div>

          <div className="form-buttons">
            <button type="button" className="form-button" onClick={() => navigate("/cadastro")}>
              Cadastro
            </button>
            <button type="submit" className="form-button">
              Login
            </button>
          </div>
        </Form>
      </Formik>
    </div>
  );
}

export default Login;
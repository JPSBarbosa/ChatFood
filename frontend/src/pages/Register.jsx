import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Axios from "axios";
import { useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();

  const handleRegister = (values) => {
    Axios.post("http://localhost:3001/auth/register", {
      nome: values.nome,
      email: values.email,
      password: values.password,
      tipo: values.tipo,
    })
      .then((response) => {
        console.log(response);
        navigate("/");
      })
      .catch((err) => {
        alert("Erro ao registrar. Verifique se o email já está cadastrado.");
      });
  };

  const validationSchema = Yup.object().shape({
    nome: Yup.string()
      .min(2, "Nome deve ter pelo menos 2 caracteres")
      .required("Campo obrigatório"),
    email: Yup.string().email("Email inválido").required("Campo obrigatório"),
    password: Yup.string()
      .min(8, "Mínimo 8 caracteres")
      .required("Campo obrigatório"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), null], "As senhas devem ser iguais")
      .required("Campo obrigatório"),
    tipo: Yup.string().oneOf(["cliente", "restaurante"], "Tipo inválido").required("Campo obrigatório"),
  });

  return (
    <div className="container">
      <h1>Cadastro</h1>
      <Formik
        initialValues={{
          nome: "",
          email: "",
          password: "",
          confirmPassword: "",
          tipo: "cliente",
        }}
        onSubmit={handleRegister}
        validationSchema={validationSchema}
      >
        <Form className="login-form">
          <div className="login-form-group">
            <Field name="nome" className="form-field" placeholder="Nome" />
            <ErrorMessage
              name="nome"
              component="span"
              className="form-error"
            />
          </div>
          <div className="login-form-group">
            <Field name="email" className="form-field" placeholder="Email" />
            <ErrorMessage
              name="email"
              component="span"
              className="form-error"
            />
          </div>
          <div className="login-form-group">
            <Field
              type="password"
              name="password"
              className="form-field"
              placeholder="Senha"
            />
            <ErrorMessage
              name="password"
              component="span"
              className="form-error"
            />
          </div>
          <div className="login-form-group">
            <Field
              type="password"
              name="confirmPassword"
              className="form-field"
              placeholder="Confirme sua senha"
            />
            <ErrorMessage
              name="confirmPassword"
              component="span"
              className="form-error"
            />
          </div>
          <div className="login-form-group">
            <label htmlFor="tipo" className="form-label">
              Tipo de usuário
            </label>
            <Field as="select" name="tipo" className="form-field">
              <option value="cliente">Cliente</option>
              <option value="restaurante">Restaurante</option>
            </Field>
            <ErrorMessage
              name="tipo"
              component="span"
              className="form-error"
            />
          </div>
          <button type="submit" className="form-button">
            Cadastrar
          </button>
        </Form>
      </Formik>
    </div>
  );
}

export default Register;
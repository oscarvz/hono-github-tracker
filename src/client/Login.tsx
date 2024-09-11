import {
  Button,
  Center,
  Paper,
  PasswordInput,
  Stack,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { login } from "./rpc";

export function Login() {
  const form = useForm({
    initialValues: {
      userName: "",
      password: "",
    },
  });

  const handleLogin = async (credentials: {
    userName: string;
    password: string;
  }) => {
    try {
      await login(credentials);
      window.location.replace("/admin");
    } catch (error) {
      console.error("Error logging in: ", error);
    }
  };

  return (
    <Center>
      <Paper p="xl" shadow="sm" radius="lg" mt="xl" withBorder>
        <form
          onSubmit={form.onSubmit((credentials) => handleLogin(credentials))}
        >
          <Stack>
            <TextInput
              required
              label="User name"
              placeholder="Your name"
              value={form.values.userName}
              onChange={(event) =>
                form.setFieldValue("userName", event.currentTarget.value)
              }
              error={form.errors.userName && "This field is required"}
            />

            <PasswordInput
              required
              label="Password"
              placeholder="Your password"
              value={form.values.password}
              onChange={(event) =>
                form.setFieldValue("password", event.currentTarget.value)
              }
              error={form.errors.password && "A password is required"}
            />

            <Button type="submit" radius="xl">
              Log in
            </Button>
          </Stack>
        </form>
      </Paper>
    </Center>
  );
}

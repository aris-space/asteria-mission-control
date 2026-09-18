import { Box, Card, Flex, Text, useMantineTheme } from "@mantine/core";
import { Link } from "react-router";
import { pages } from "../../pages";

function Views() {
  const theme = useMantineTheme();

  return (
    <Box
      p="lg"
      h="fit-content"
      w="100%"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        gap: theme.spacing.sm,
      }}
    >
      {pages.map((page) => (
        <Link
          key={page.path}
          to={page.path}
          style={{
            textDecoration: "none",
          }}
        >
          <Card
            h="100%"
            withBorder
            radius="md"
            p="lg"
            style={{ cursor: "pointer" }}
          >
            <Flex direction="column" gap="sm">
              {page.icon}
              <Text fw={600} size="lg">
                {page.title}
              </Text>
              <Text c="dimmed" size="sm">
                {page.description}
              </Text>
            </Flex>
          </Card>
        </Link>
      ))}
    </Box>
  );
}

export default Views;

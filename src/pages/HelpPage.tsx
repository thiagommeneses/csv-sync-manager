
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const HelpPage = () => {
  const helpTopics = [
    {
      id: "overview",
      title: "Visão Geral",
      content: `O CSV Sync Manager é uma ferramenta desenvolvida para facilitar a integração 
      de dados entre plataformas de mensageria como OmniChat e Zenvia. Com esta aplicação, 
      você pode fazer upload, visualizar, editar e exportar arquivos CSV de forma simples e eficiente.`
    },
    {
      id: "upload",
      title: "Upload de Arquivos",
      content: `Para começar a utilizar o CSV Sync Manager, faça o upload de um arquivo CSV 
      válido. O sistema aceita arquivos com tamanho máximo de 50MB e que contenham, no mínimo, 
      as colunas 'phone', 'template_title' e 'reply_message_text'.`
    },
    {
      id: "filters",
      title: "Filtros Avançados",
      content: `A seção de Filtros Avançados permite manipular e filtrar seus dados:
      
      - Filtro de Números de Telefone: remova números duplicados e/ou corrija o formato dos números para o padrão internacional.
      - Filtro de Mensagens: visualize todas as mensagens, apenas mensagens vazias ou filtre por texto específico.
      - Filtro de Templates: visualize todos os templates, apenas templates vazios ou filtre por texto específico.
      - Mostrar apenas colunas principais: exibe somente as colunas 'phone', 'template_title' e 'reply_message_text'.`
    },
    {
      id: "export",
      title: "Exportação de Dados",
      content: `O CSV Sync Manager oferece duas opções de exportação:
      
      - Exportar para OmniChat: cria um arquivo CSV com uma única coluna 'fullNumber', contendo os números de telefone normalizados.
      - Exportar para Zenvia: cria um arquivo CSV com duas colunas - 'celular' e 'sms'. A coluna 'sms' contém o texto que você deseja enviar, com limite recomendado de 160 caracteres.`
    },
    {
      id: "phone-format",
      title: "Formato de Números",
      content: `O sistema normaliza os números de telefone para o formato internacional:
      
      - Remove todos os caracteres não numéricos
      - Remove o 0 inicial, se presente
      - Adiciona o código internacional do Brasil (55) se não estiver presente
      - Exemplo: (11) 98765-4321 -> 5511987654321`
    },
    {
      id: "limits",
      title: "Limites do Sistema",
      content: `O CSV Sync Manager possui os seguintes limites:
      
      - Tamanho máximo de arquivo: 50MB
      - Tamanho máximo de lote: 30.000 registros (exibindo 50 por vez)
      - Timeout de processamento: 90 segundos (para operações complexas)
      - Suporte apenas para arquivos CSV`
    },
    {
      id: "tips",
      title: "Dicas e Boas Práticas",
      content: `Para obter o melhor desempenho do CSV Sync Manager:
      
      - Certifique-se de que seu arquivo CSV contenha um cabeçalho
      - Verifique se o arquivo contém as colunas obrigatórias (phone, template_title, reply_message_text)
      - Para envios via Zenvia, mantenha as mensagens SMS dentro do limite de 160 caracteres
      - Utilize a funcionalidade de correção de formato de números para garantir compatibilidade`
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Ajuda e Documentação</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Aprenda a utilizar todas as funcionalidades do CSV Sync Manager
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Perguntas Frequentes</CardTitle>
          <CardDescription>
            Tudo o que você precisa saber para usar o CSV Sync Manager eficientemente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {helpTopics.map((topic) => (
              <AccordionItem key={topic.id} value={topic.id}>
                <AccordionTrigger>{topic.title}</AccordionTrigger>
                <AccordionContent className="whitespace-pre-line">
                  {topic.content}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contato e Suporte</CardTitle>
          <CardDescription>
            Precisa de ajuda adicional? Entre em contato com nossa equipe
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Para dúvidas, sugestões ou reportar problemas, entre em contato pelos seguintes canais:
          </p>
          <ul className="space-y-2 list-disc pl-5">
            <li>Email: suporte@csvsyncmanager.com.br</li>
            <li>Whatsapp: (11) 98765-4321</li>
            <li>Horário de atendimento: Segunda a Sexta, das 9h às 18h</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default HelpPage;

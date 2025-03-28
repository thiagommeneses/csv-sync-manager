
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Mail, Globe, Clock, ExternalLink } from "lucide-react";

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

      <Card className="overflow-hidden border-none shadow-md">
        <div className="bg-gradient-to-r from-csvManager to-csvManager-mid p-6 text-white">
          <CardTitle className="flex items-center gap-2 text-2xl">
            <MessageSquare className="h-6 w-6" />
            Contato e Suporte
          </CardTitle>
          <CardDescription className="text-white/90 mt-2">
            Precisa de ajuda adicional? Entre em contato com nossa equipe
          </CardDescription>
        </div>
        
        <CardContent className="p-6 bg-white dark:bg-gray-800">
          <p className="mb-4 text-gray-700 dark:text-gray-300">
            Para dúvidas, sugestões ou reportar problemas, entre em contato pelos seguintes canais:
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
                <Globe className="h-5 w-5 text-csvManager" />
              </div>
              <div>
                <p className="font-medium">Site</p>
                <a 
                  href="https://pixmeyou.com/?utm_source=csv_manager&utm_medium=app&utm_campaign=help_section" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-csvManager hover:underline flex items-center gap-1"
                >
                  pixmeyou.com
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
                <Mail className="h-5 w-5 text-csvManager" />
              </div>
              <div>
                <p className="font-medium">Email</p>
                <a 
                  href="mailto:suporte@pixmeyou.com" 
                  className="text-csvManager hover:underline"
                >
                  suporte@pixmeyou.com
                </a>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  className="h-5 w-5 text-green-600 dark:text-green-400"
                  fill="currentColor"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </div>
              <div>
                <p className="font-medium">WhatsApp</p>
                <a 
                  href="https://wa.me/5562982348664" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-green-600 dark:text-green-400 hover:underline flex items-center gap-1"
                >
                  (62) 98234-8664
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
                <Clock className="h-5 w-5 text-csvManager" />
              </div>
              <div>
                <p className="font-medium">Horário de atendimento</p>
                <p className="text-gray-600 dark:text-gray-400">Segunda a Sexta, das 9h às 17h</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-none shadow-md bg-gradient-to-br from-csvManager-dark via-csvManager to-csvManager-mid">
        <CardContent className="p-0">
          <div className="relative">
            <div className="absolute inset-0 bg-black/20 z-0 rounded-lg"></div>
            <div className="relative z-10 p-6 text-white">
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/40">
                    <span className="text-2xl font-bold tracking-tight">TM</span>
                  </div>
                </div>
                
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">Desenvolvedor</h3>
                  <h2 className="text-2xl font-bold mb-3">Thiago Marques Meneses</h2>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge className="bg-white/20 hover:bg-white/30 text-white">Profissional de Dados</Badge>
                    <Badge className="bg-white/20 hover:bg-white/30 text-white">Desenvolvedor Full Stack</Badge>
                    <Badge className="bg-white/20 hover:bg-white/30 text-white">Especialista em Soluções Tecnológicas</Badge>
                  </div>
                  
                  <p className="text-white/90 leading-relaxed">
                    Especialista em Automação e Análise de Dados – Trazendo inovação e eficiência 
                    para Negócios Digitais e Mercado Financeiro com soluções tecnológicas personalizadas.
                  </p>
                </div>
              </div>
            </div>
            
            <svg className="absolute bottom-0 left-0 right-0 text-white/5 z-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
              <path fill="currentColor" fillOpacity="1" d="M0,224L48,213.3C96,203,192,181,288,154.7C384,128,480,96,576,117.3C672,139,768,213,864,218.7C960,224,1056,160,1152,128C1248,96,1344,96,1392,96L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
            </svg>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HelpPage;

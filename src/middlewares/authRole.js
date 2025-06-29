// src/middlewares/authRole.js

import User from '../models/User.js'; 


export const authRole = (requiredRole) => {
  return async (req, res, next) => {
    
    if (!req.userId) {
      return res.status(401).json({ message: 'Autenticação necessária. ID do usuário ausente.' });
    }

    try {
      
      const user = await User.findById(req.userId);

      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado.' });
      }

     
      if (user.role !== requiredRole) {
        return res.status(403).json({ message: 'Acesso negado. Você não tem permissão para esta ação.' });
      }

     
      req.user = user; 

      // Prossegue para o próximo middleware ou para a função do controller
      next();
    } catch (error) {
      console.error("Erro no middleware de autorização (authRole):", error);
      return res.status(500).json({ message: 'Erro interno do servidor ao verificar permissões.' });
    }
  };
};
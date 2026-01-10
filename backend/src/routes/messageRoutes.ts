import express from "express";
import { Message } from "../models/message";
import { User } from "../models/user"; 

const router = express.Router();

router.get("/:user1/:user2", async (req, res) => {
  const { user1, user2 } = req.params;

  try {
    const messages = await Message.find({
      $or: [
        { from: user1, to: user2 },
        { from: user2, to: user1 },
      ],
    })
      .sort({ createdAt: 1 })
      .populate("from to", "username avatar");

    return res.json(messages);
  } catch (err) {
    console.error("❌ Error al obtener mensajes:", err);
    res.status(500).json({ message: "Error al obtener mensajes" });
  }
});


router.post("/", async (req, res) => {
  const { from, to, message } = req.body;

  try {
    const [sender, receiver] = await Promise.all([
      User.findOne({ username: from }),
      User.findOne({ username: to }),
    ]);

    if (!sender || !receiver) {
      return res.status(404).json({ message: "Usuarios no encontrados" });
    }

    const newMessage = new Message({
      from: sender._id,
      to: receiver._id,
      message,
    });

    await newMessage.save();

    res.status(201).json(newMessage);
  } catch (err) {
    console.error("❌ Error al guardar mensaje:", err);
    res.status(500).json({ message: "Error al guardar mensaje" });
  }
});

export default router;

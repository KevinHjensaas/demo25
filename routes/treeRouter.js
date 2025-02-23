const express = require('express');
const router = express.Router();

const tree = require("../data/treeData");


router.get('/', (req, res) => {
    res.json(tree);
});

router.post('/', (req, res) => {
    const { parentId, name } = req.body;

    const newNode = { id: Date.now(), name, children: [] };

    function addNode(node) {
        if (node.id === parentId) {
            node.children.push(newNode);
            return true;
        }
        for (let child of node.children) {
            if (addNode(child)) return true;
        }
        return false;
    }

    if (!addNode(tree)) {
        return res.status(400).json({ error: "Forelder ikke funnet" });
    }

    res.status(201).json(newNode);
});

router.put('/:id', (req, res) => {
    const { name } = req.body;
    const nodeId = parseInt(req.params.id);

    function updateNode(node) {
        if (node.id === nodeId) {
            node.name = name;
            return true;
        }
        for (let child of node.children) {
            if (updateNode(child)) return true;
        }
        return false;
    }

    if (!updateNode(tree)) {
        return res.status(404).json({ error: "Node ikke funnet" });
    }

    res.json({ message: "Node oppdatert" });
});

router.delete('/:id', (req, res) => {
    const nodeId = parseInt(req.params.id);

    function deleteNode(parent, nodeId) {
        const index = parent.children.findIndex(child => child.id === nodeId);
        if (index !== -1) {
            parent.children.splice(index, 1);
            return true;
        }
        for (let child of parent.children) {
            if (deleteNode(child, nodeId)) return true;
        }
        return false;
    }

    if (!deleteNode(tree, nodeId)) {
        return res.status(404).json({ error: "Node ikke funnet" });
    }

    res.json({ message: "Node slettet" });
});

module.exports = router;

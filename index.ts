import express, { Request, Response } from 'express';
import path from 'path';
import fetch from 'node-fetch';

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', async (req: Request, res: Response) => {
    try {
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=20');
        const data = await response.json();
        res.render('index', { results: data.results });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching data.');
    }
});

app.get('/pokemon/:name', async (req: Request, res: Response) => {
    const pokemonName = req.params.name;
    try {
        const pokemonResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);
        const pokemonData = await pokemonResponse.json();

        const speciesResponse = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemonName}`);
        const speciesData = await speciesResponse.json();

        // Encontrar a cadeia de evolução do Pokémon
        const evolutionChainUrl = speciesData.evolution_chain.url;
        const evolutionChainResponse = await fetch(evolutionChainUrl);
        const evolutionChainData = await evolutionChainResponse.json();

        // Mapear os dados de evolução
        const getEvolutionNames = (chain: any, names: string[] = []): string[] => {
            names.push(chain.species.name);
            if (chain.evolves_to.length > 0) {
                return getEvolutionNames(chain.evolves_to[0], names);
            }
            return names;
        };

        const evolutionNames = getEvolutionNames(evolutionChainData.chain);

        res.render('pokemonDetail', {
            pokemon: {
                ...pokemonData,
                evolutions: evolutionNames
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching Pokémon details.');
    }
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});

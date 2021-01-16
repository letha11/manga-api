# Manga API

API Manga bahasa Indonesia

# Usage

1. Clone this repository
   ```bash
<<<<<<< HEAD
   git clone https://github.com/letha11/manga-api.git
=======
   git clone https://github.com/febryardiansyah/manga-api.git
>>>>>>> 24fe17c4960483719e9c600d353c2db68a84ee2d
   ```
2. Install dependecies

   ```bash
   yarn
   # OR
   npm install
   ```

3. Start the development environment (\*if you haven't installed nodemon globally, you can do `npm install -g nodemon `

   ```bash
   npm run dev
   # OR
   npm run start
   ```

<<<<<<< HEAD
4. visit http://localhost:5000/api

# Documentation

**API PATH** = https://mangaoi.herokuapp.com/api/

## All Manga

Get All Manga

```
manga/filter/[pageNumber]
```

example : https://mangaoi.herokuapp.com/api/manga/filter/1

## Genres

```
genres/
```

example : https://mangaoi.herokuapp.com/api/genres/

you can see the value of genre, type, order, status. you can use it like this :

```
manga/filter/[pageNumber]?genre=[genreValue]&type=[typeValue]&order=[orderValue]&status=[statusValue]
```

example : https://mangaoi.herokuapp.com/api/manga/filter/1?genre=9&type=manhwa&order=popular&status=ongoing

that example above is going to search manga that have **genre of action** AND **comic type is manhwa** AND **order by popularity** AND **status is ongoing**

## Manga Detail

```
manga/detail/[endpoint]
```

example : https://mangaoi.herokuapp.com/api/manga/detail/god-of-blackfield

## Chapter

```
ch/[endpoint]
```

example : https://mangaoi.herokuapp.com/api/ch/god-of-blackfield-chapter-57-bahasa-indonesia/
=======
4. visit http://localhost:500/api

## Todos

- ⬜️ add documentation
>>>>>>> 24fe17c4960483719e9c600d353c2db68a84ee2d

import axios, { AxiosError } from 'axios';
import * as github from './types';

const DEBUG = false;
const gitUsername = process.argv.slice(2)[0] as string | undefined;

if (!gitUsername) {
  console.log('No github username was given.');
  process.exit(0);
}

const GH_TOKEN = '132affe34d6cb8a21b448b92028b171416a1dec6';
const GIT_HUB_URL = 'https://api.github.com';
axios.defaults.headers.common = {'Authorization': `bearer ${GH_TOKEN}`}

type LanguageList = { [key: string]: string[]; } // ex: { Java: [rep1, rep2, re3] }
type LanguageCodeLines = { [key: string]: number[]; } // ex: { Java: [20000, 30000, 40000] }


/**
 * Retrieve all repositories from a given GH user
 * by his id (login)
 *
 * @param {string} gitUsername
 * @returns {github.Repository[]} repositories
 */
const getUserRepositories = async (gitUsername: string) => {
  try {
    const res = await axios.get(`${GIT_HUB_URL}/users/${gitUsername}/repos`);
    const result = res.data as github.Repository[];
    if (DEBUG) console.log('get user repositories');
    return result;
  } catch (error) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.status === 404) {
      console.log('No github username was found.');
      process.exit(0);
    }
    if (axiosError.response?.status === 403) {
      console.log('Too much requests to github without authentication.');
      process.exit(0);
    }
    else {
      if (DEBUG) console.log('Error in get user repositories');
       throw new Error(error);
    }
  }
}


/**
 * Get only public repositories of a given repositories collection.
 *
 * @param {github.Repository[]} repositories
 */
const filterPublicRepositories = (repositories: github.Repository[]) => {
  const publicRepositories = repositories.filter(repo => repo.private === false);
  if (!publicRepositories.length) {
    console.log('No public repositories found.');
    process.exit(0);
  }
  return publicRepositories;
}

/**
 * Get contribution of a given github user
 * filtering all contributions by his id (login)
 *
 * @param {github.Contributor[]} contributors
 * @param {string} login
 */
const getUserContributionToThisRepository = (contributors: github.Contributor[], login: string) => contributors.filter((contributor) => contributor.author.login === login);

/**
 * This function creates a collection of object in the form of
 * { language: repository[] }
 *
 * @param {github.Repository[]} repositories
 * @returns {LanguageList}
 */
const createUserLanguageList = (repositories: github.Repository[]) => {
  const languageRepartition: LanguageList = {};
  repositories.forEach((repository) => {
    if (repository.language) {
      if (Array.isArray(languageRepartition[repository.language])) {
        languageRepartition[repository.language].push(repository.full_name)
      } else {
        languageRepartition[repository.language] = [repository.full_name];
      }
    }
  });
  if (!Object.keys(languageRepartition).length) throw new Error('User languages are undefined');
  return languageRepartition;
};

/**
 * This functions gets all contributions to a given repository,
 * then it filters the contributions of a given user
 * and then returns the number of lines that the user wrote (or deleted)
 * the reduce part is taken from a stackoverflow question:
 * https://stackoverflow.com/questions/26881441/can-you-get-the-number-of-lines-of-code-from-a-github-repository
 * and is probably wrong (maybe should take into account other weeks?).
 *
 * @param {string} language
 * @param {string} repositoryName
 * @param {string} gitUsername
 * @returns {Promise<number>}
 */
const getCodeLinesFromRepository = async (language: string, repositoryName: string, gitUsername: string) => {
  try {
    const res = await axios.get(`${GIT_HUB_URL}/repos/${repositoryName}/stats/contributors`);
    const contributors = res.data as github.Contributor[];
    const userContributions = getUserContributionToThisRepository(contributors, gitUsername);
    if (!userContributions.length) {
      if (DEBUG) console.log(`${repositoryName} is in ${language} has no contribution from this user`);
      return 0;
    }
    const lines = userContributions.map(contributor => contributor.weeks
      .reduce((lineCount, week) => lineCount + week.a - week.d, 0))
      .reduce((lineTotal, lineCount) => lineTotal + lineCount);
    const positiveLines = Math.abs(lines); // we consider that even removing lines is a contribution to a project
    if (DEBUG) console.log(`${repositoryName} is in ${language} and has ${positiveLines} lines`);
    return positiveLines;
  } catch (error) {
    if (DEBUG) console.log('Error in get Code Lines From Repository');
    throw new Error(error);
  }
}

/**
 * This function iterates an array of languages and its array of repositories
 *
 *
 * @param {LanguageList} languageList
 * @param {string} gitUsername
 * @returns {Promise<LanguageList>[]}
 */
const getCodeLinesForAllLanguages = (languageList: LanguageList, gitUsername: string) => {

  const languages = Object.keys(languageList);

  return Promise.all(languages.map(async (language) => {
    const linesPerRepository = await Promise.all(languageList[language].map(async (repositoryName: string) => {
      return await getCodeLinesFromRepository(language, repositoryName, gitUsername);
    }));
    return { [language]: linesPerRepository }
  }));
}

/**
 * Sum the line of code of every language type
 *
 * @param {LanguageCodeLines[]} languages
 * @returns {[string, number][]}
 */
const sumLinesOfCodePerLanguage = (languages: LanguageCodeLines[]) => languages.map((language: LanguageCodeLines) => {
  const [[languageName, codeLines]] = Object.entries(language);
  const sumOfCodeLines = codeLines.reduce((lineTotal, lineCount) => lineTotal + lineCount);
  return [languageName, sumOfCodeLines] as [string, number];
});

/**
 * Sort list by code line quantity
 *
 * @param {[string, number][]} languages
 */
const reorderListByCodeLineQuantity = (languages: [string, number][]) => [...languages.sort((a, b) => b[1] - a[1])];

/**
 * Print list in console
 *
 * @param {[string, number][]} printableList
 * @param {string} gitUsername
 */
const printList = (printableList: [string, number][], gitUsername: string) => {
  console.log(`Language repartition for ${gitUsername}`);
  printableList.forEach(([ languageName, sumOfCodeLines ]) => {
    console.log(`* ${sumOfCodeLines}: ${languageName}`);
  })
}

const init = async (gitUsername: string) => {
  const userRepositories = await getUserRepositories(gitUsername);
  const userPublicRepositories = filterPublicRepositories(userRepositories);
  const userLanguageList = createUserLanguageList(userPublicRepositories);
  const listOfLanguagesAndCorrespondingCodeLines = await getCodeLinesForAllLanguages(userLanguageList, gitUsername);
  const unorderedPrintableList = sumLinesOfCodePerLanguage(listOfLanguagesAndCorrespondingCodeLines);
  const orderedPrintableList = reorderListByCodeLineQuantity(unorderedPrintableList);
  printList(orderedPrintableList, gitUsername);
}

init(gitUsername);

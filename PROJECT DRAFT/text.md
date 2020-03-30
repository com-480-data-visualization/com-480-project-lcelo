### Dataset

One big issue with choosing this subject is that we have only limited data: the virus started to spread officially from December 2019, and most of the dataset on the internet contains data from mid-january only.

Our datasets (this might be updated with further dataset):
1. Novel Corona Virus 2019 Dataset : https://www.kaggle.com/sudalairajkumar/novel-corona-virus-2019-dataset
2. COVID19 Cases Switzerland: https://www.kaggle.com/daenuprobst/covid19-cases-switzerland
3. COVID-19 Data Repository by Johns Hopkins CSSE https://github.com/CSSEGISandData/COVID-19


Data has been produced to be quickly usable so it has been well cleaned even if sometimes we can feel the lack of data and inconsistency over columns (not all rows contains all features).


We will also would like to use APIs to provide real-time data (as much as possible) for some of the visualization:
1. API per country: https://rapidapi.com/collection/coronavirus-covid-19
2. API (35$ a month or web scraping):  https://www.worldometers.info/coronavirus/


### Problematic

Covid-19, SARS-Cov-2, Coronavirus are probably the most used words for the last few months and will be the hot topic for this beginning of 2020.
This new virus was discovered in Wuhan (China) late 2019. It belongs to the coronavirus family and gives Covid-19 disease to humans. This disease symptoms are similar to flu but has more complication (eg. pneumonia). Being very virulent and extremmely contagious, it's rapidly spreading and lead to thousands of deaths since hospitals are not able to provide respiratory support for needy patients. Since it's unknown to any human's immunity system, we need to contain the spreading in order to avoid deaths due to the lack of hospital equipments.

The aim of this course is to learn to design. But we also want to design to learn from the data we're studying. We're all concerned by this virus Sars-Cov-2, and we are taking this opportunity to learn more about the impact of this virus on our world.

Our ambition is to implement a platform where you can observe the virus spread in the world over time. Not only providing numbers, our goal is to use interactive data visualization techniques to allow user to "feel" the data.

By "feel", we mean:
- raise consciousness about the virus, its dangerousity (symptoms/risk factors), prevention
- present facts about the number of deaths or recovered/confirmed patients across the world
- allow user to compare data between countries and establish his own opinion
- find correlation between virus spread and other factors (eg. impact on economy)


To sum up, we want to provide a data story that will lead to awareness, understanding and acceptance with only facts.
We are targetting people that want to see the evolution of this pandemic but also people that are not following safety measures. Indeed, we hope our data story will help them change their behaviours in order to reduce the spread of the virus for the sake of hospital systems across the world.


### Exploratory Data Analysis

__Pre-processing of the data set you chose:
Show some basic statistics and get insights about the data:__


Dataset 1:
- identify and remove vectors full of NaN
- for symptoms: some rows contains several symptoms together, we need to melt the data in order to use this
- we have summary for 1086 patients (text) that we want to do wordcloud

The dataset 1. contains data for 171 countries. We have data for deaths/confirmed/recovered cases from 22th January 2020 to 22th March 2020 for now.
Looking closer to the data (COVID19_open_line_list.csv), we have lots of NaN for symptoms, sex, chronic disease,...
COVID19_line_list_data.csv contains data about patients but only 1'085 rows on this file.


----> same thing for dataset 2, 3 etc?

### Related work

__What others have already done with the data?__
- https://gisanddata.maps.arcgis.com/apps/opsdashboard/index.html#/bda7594740fd40299423467b48e9ecf6


__Why is your approach original?__
By combining measured **facts** with an **interactive** platform, we're being original. Indeed, it amplifies the cognition with the data and lots of the websites provide only counters and graphs for now which don't allow to dive into the data. Moreover, we would like to measure its impact on other domains (we've considered only economical impact for now).


__What source of inspiration do you take? Visualizations that you found on other websites or magazines (might be unrelated to your data).__
- http://bl.ocks.org/KoGor/5994804
- https://www.worldometers.info/coronavirus/coronavirus-cases/
- https://experience.arcgis.com/experience/685d0ace521648f8a5beeeee1b9125cd
- https://www.arcgis.com/apps/opsdashboard/index.html#/bda7594740fd40299423467b48e9ecf6
- https://www.covidvisualizer.com
- http://coronaboard.ch

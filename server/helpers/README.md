* USAGE

**helpers**

1. gitlog
```
  getUpdatedFilesFromGitLog(
                            { 
                              repo: '/path/to/cloned_repo', since: '2018-01-01', before: '2018-01-11'
                            }, 
                              function(updatedFiles){
                                  console.log(updatedFiles)
                               }
                           )
```
2. testrail
```
  setTestRailCredentials('username', 'password')
  addRunInTestRail('191', { "name": "This is a new test run", "case_ids": ['1065399', '1065401'], "include_all": false, "suite_id": 6311 })
  ```
